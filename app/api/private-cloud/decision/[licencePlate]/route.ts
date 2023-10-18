import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { DecisionStatus, Cluster } from "@prisma/client";
import { string, z } from "zod";
import { PrivateCloudDecisionRequestBodySchema } from "@/schema";
import makeDecisionRequest, {
  PrivateCloudRequestWithRequestedProject
} from "@/requestActions/private-cloud/decisionRequest";
import sendPrivateCloudNatsMessage from "@/nats/privateCloud";
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

const ParamsSchema = z.object({
  licencePlate: string()
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  // Athentication
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("You do not have the required credentials.", {
      status: 401
    });
  }

  const { email: authEmail, roles: authRoles } = session.user;

  if (!authRoles.includes("admin")) {
    return new NextResponse(
      "You must be an admin to make a request decision.",
      {
        status: 403
      }
    );
  }

  const body = await req.json();

  // Validation
  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = PrivateCloudDecisionRequestBodySchema.safeParse(body);

  if (!parsedParams.success) {
    console.log(parsedParams.error.message);
    return new Response(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    console.log(parsedBody.error.message);
    return new Response(parsedBody.error.message, { status: 400 });
  }

  const { licencePlate } = parsedParams.data;
  const { decision, humanComment, ...requestedProjectFormData } =
    parsedBody.data;

  try {
    const request: PrivateCloudRequestWithRequestedProject =
      await makeDecisionRequest(
        licencePlate,
        decision,
        humanComment,
        requestedProjectFormData,
        authEmail
      );

    if (!request.requestedProject) {
      return new Response(
        `Error creating decision request for ${request.licencePlate}.`,
        {
          status: 200
        }
      );
    }

    const contactChanged =
      requestedProjectFormData.projectOwner.email !==
        request.requestedProject.projectOwner.email ||
      requestedProjectFormData.primaryTechnicalLead.email !==
        request.requestedProject.primaryTechnicalLead.email ||
      requestedProjectFormData.secondaryTechnicalLead?.email !==
        request.requestedProject?.secondaryTechnicalLead?.email;

    if (request.decisionStatus === DecisionStatus.APPROVED) {
      await sendPrivateCloudNatsMessage(
        request.id,
        request.type,
        request.requestedProject,
        contactChanged
      );

      // For GOLD requests, we create an identical request for GOLDDR
      if (request.requestedProject.cluster === Cluster.GOLD) {
        await sendPrivateCloudNatsMessage(
          request.id,
          request.type,
          { ...request.requestedProject, cluster: Cluster.GOLDDR },
          contactChanged
        );
      }
    }

    return new NextResponse(
      `Decision request for ${request.licencePlate} succesfully created.`,
      {
        status: 200
      }
    );
  } catch (e) {
    console.log(e);
    return new NextResponse("Error creating decision request", { status: 400 });
  }
}
