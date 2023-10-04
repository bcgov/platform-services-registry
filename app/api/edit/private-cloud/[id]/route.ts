import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  RequestType,
  PrivateCloudRequest,
  DecisionStatus,
  PrivateCloudProject,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { EditRequestBodySchema, EditRequestBody, UserInput } from "@/schema";
import { string, z } from "zod";
import editRequest from "@/requestActions/private-cloud/editRequest";
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

const ParamsSchema = z.object({
  id: string(),
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: "You do not have the required credentials.",
    });
  }

  const { email: authEmail, roles: authRoles } = session.user;

  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = EditRequestBodySchema.safeParse(req.body);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const formData: EditRequestBody = parsedBody.data;
  const { id: projectId } = parsedParams.data;

  if (
    ![
      formData.projectOwner.email,
      formData.primaryTechnicalLead.email,
      formData.secondaryTechnicalLead?.email,
    ].includes(authEmail) &&
    !authRoles.includes("admin")
  ) {
    throw new Error(
      "You need to assign yourself to this project in order to create it."
    );
  }

  let request: PrivateCloudRequest;

  try {
    const existingRequest: PrivateCloudRequest | null =
      await prisma.privateCloudRequest.findFirst({
        where: {
          AND: [{ projectId: projectId }, { active: true }],
        },
      });

    if (existingRequest !== null) {
      throw new Error(
        "This project already has an active request or it does not exist."
      );
    }

    request = await editRequest(projectId, formData, authEmail);

    // await sendEditRequestEmails(
    //   editRequest.project,
    //   editRequest.requestedProject
    // );
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        throw new Error("There is already an active request for this project.");
      }
    }
    throw e;
  }

  // if (decisionStatus === DecisionStatus.Approved) {
  //   await sendNatsMessage(editRequest.type, editRequest.requestedProject);

  //   if (editRequest.requestedProject.cluster === Cluster.Gold) {
  //     const goldDrRequest = { ...editRequest };
  //     goldDrRequest.requestedProject.cluster = Cluster.Golddr;
  //     await sendNatsMessage(goldDrRequest.type, goldDrRequest.requestedProject);
  //   }
  // }

  return request;
}
