import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrivateCloudRequest, DecisionStatus } from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { string, z } from "zod";
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

const DecisionStatusBodySchema = z.object({
  id: string(),
  decision: z.enum(["APPROVED", "REJECTED"]),
  comment: string().optional()
});

const ParamsSchema = z.object({
  id: string()
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: "You do not have the required credentials."
    });
  }

  const { email: authEmail, roles: authRoles } = session.user;

  if (!authRoles.includes("admin")) {
    throw new Error("You must be an admin to make a request decision.");
  }

  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = DecisionStatusBodySchema.safeParse(req.body);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const { decision, comment } = parsedBody.data;
  const { id: requestId } = parsedParams.data;

  let request: PrivateCloudRequest;

  try {
    request = await prisma.privateCloudRequest.update({
      where: {
        id: requestId,
        decisionStatus: DecisionStatus.PENDING
      },
      data: {
        decisionStatus: decision,
        comment,
        active: decision === DecisionStatus.APPROVED,
        decisionDate: new Date(),
        decisionMakerEmail: authEmail
      },
      include: {
        project: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true
          }
        },
        requestedProject: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true
          }
        }
      }
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025") {
        throw new Error("Request not found or already has a decision.");
      }
    }
    throw e;
  }

  if (request.type === "DELETE") {
    throw Error("Delete is dissabled");
    return;
  }

  // if (request.decisionStatus === RequestDecision.APPROVED) {
  //   await sendNatsMessage(request.type, request.requestedProject);

  //   if (request.requestedProject.cluster === Cluster.GOLD) {
  //     const goldDrRequest = { ...request };
  //     goldDrRequest.requestedProject.cluster = Cluster.GOLDDR;
  //     await sendNatsMessage(goldDrRequest.type, goldDrRequest.requestedProject);
  //   }
  // }
  // if (request.decisionStatus === RequestDecision.Rejected) {
  //   sendRejectEmail(request);
  // }

  return request;
}
