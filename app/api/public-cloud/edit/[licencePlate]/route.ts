import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PublicCloudRequest } from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  PublicCloudEditRequestBodySchema,
  PublicCloudEditRequestBody,
  UserInput,
} from "@/schema";
import { string, z } from "zod";
import editRequest from "@/requestActions/public-cloud/editRequest";
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

const ParamsSchema = z.object({
  licencePlate: string(),
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

  const body = await req.json();

  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = PublicCloudEditRequestBodySchema.safeParse(body);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const formData: PublicCloudEditRequestBody = parsedBody.data;
  const { licencePlate } = parsedParams.data;

  if (
    ![
      formData.projectOwner.email,
      formData.primaryTechnicalLead.email,
      formData.secondaryTechnicalLead?.email,
    ].includes(authEmail) &&
    !authRoles.includes("admin")
  ) {
    throw new Error(
      "You need to assign yourself to this project in order to create it.",
    );
  }

  try {
    const existingRequest: PublicCloudRequest | null =
      await prisma.publicCloudRequest.findFirst({
        where: {
          AND: [{ licencePlate }, { active: true }],
        },
      });

    if (existingRequest !== null) {
      throw new Error(
        "This project already has an active request or it does not exist.",
      );
    }

    await editRequest(licencePlate, formData, authEmail);

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

  return new NextResponse("success", { status: 200 });
}
