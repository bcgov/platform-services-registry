import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  PrivateCloudRequest,
  DecisionStatus,
  PrivateCloudRequestedProject,
  PrivateCloudRequestedProjectPayload,
  Cluster,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { string, z } from "zod";
import { DecisionRequestBodySchema } from "@/schema";
import { checkObjectEquality } from "@/lib/isProjectEqual";
import decisionRequest, {
  PrivateCloudRequestWithAdminRequestedProject,
} from "@/requestActions/private-cloud/decisionRequest";
import sendPrivateCloudNatsMessage from "@/nats/privateCloud";
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

const ParamsSchema = z.object({
  id: string(),
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  // Athentication
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("You do not have the required credentials.", {
      status: 401,
    });
  }

  const { email: authEmail, roles: authRoles } = session.user;

  if (!authRoles.includes("admin")) {
    return (
      new NextResponse("You must be an admin to make a request decision."),
      { status: 401 }
    );
  }

  const body = await req.json();

  // Validation
  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = DecisionRequestBodySchema.safeParse(body);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const { id: requestId } = parsedParams.data;
  const { decision, humanComment, ...requestedProjectFormData } =
    parsedBody.data;

  try {
    const request: PrivateCloudRequestWithAdminRequestedProject =
      await decisionRequest(
        requestId,
        decision,
        humanComment,
        requestedProjectFormData,
        authEmail
      );

    if (!request.adminRequestedProject) {
      return new NextResponse(
        `Error creating decision request for ${request.licencePlate}.`,
        {
          status: 200,
        }
      );
    }

    const contactChanged =
      requestedProjectFormData.projectOwner.email !==
        request.adminRequestedProject.projectOwner.email ||
      requestedProjectFormData.primaryTechnicalLead.email !==
        request.adminRequestedProject.primaryTechnicalLead.email ||
      requestedProjectFormData.secondaryTechnicalLead?.email !==
        request.adminRequestedProject?.secondaryTechnicalLead?.email;

    if (request.decisionStatus === DecisionStatus.APPROVED) {
      await sendPrivateCloudNatsMessage(
        request.id,
        request.type,
        request.adminRequestedProject,
        contactChanged
      );

      // For GOLD requests, we create an identical request for GOLDDR
      if (request.adminRequestedProject.cluster === Cluster.GOLD) {
        await sendPrivateCloudNatsMessage(
          request.id,
          request.type,
          { ...request.adminRequestedProject, cluster: Cluster.GOLDDR },
          contactChanged
        );
      }
    }
    return new NextResponse(
      `Decision request for ${request.licencePlate} succesfully created.`,
      {
        status: 200,
      }
    );
  } catch (e) {
    console.log(e);
    return new NextResponse("Error creating decision request", { status: 400 });
  }
}
