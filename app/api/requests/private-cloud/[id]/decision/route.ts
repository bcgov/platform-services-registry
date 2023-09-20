import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  PrivateCloudRequest,
  DecisionStatus,
  PrivateCloudRequestedProject,
  PrivateCloudRequestedProjectPayload,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { string, z } from "zod";
import { DecisionRequestBodySchema } from "@/schema";
import { deepStrictEqual } from "assert";
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

  // const {
  //   decision,
  //   comment,
  //   projectOwner,
  //   primaryTechnicalLead,
  //   secondaryTechnicalLead,
  //   ...rest
  // } = parsedBody.data;

  const { decision, comment, ...requestedProjectFormData } = parsedBody.data;

  const request = await prisma.privateCloudRequest.findUnique({
    where: {
      id: requestId,
    },
    include: {
      requestedProject: {
        include: {
          projectOwner: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              ministry: true,
            },
          },
          primaryTechnicalLead: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              ministry: true,
            },
          },
          secondaryTechnicalLead: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              ministry: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    return new NextResponse("Request not found.", { status: 404 });
  }

  const {
    id,
    licencePlate,
    status,
    created,
    projectOwnerId,
    primaryTechnicalLeadId,
    secondaryTechnicalLeadId,
    ...currentRequestedProject
  } = request?.requestedProject;

  console.log("REQUEST");
  console.log(request?.requestedProject);

  console.log("REQUESTED PROJECT FORM DATA");
  console.log(requestedProjectFormData);

  // comapre the two objects requestedProjectFormData and  currentRequestedProject making sure that all of the values for the keys in requestedProjectFormData are the same as the ones in currentRequestedProject

  const isEqual = deepStrictEqual(
    currentRequestedProject,
    requestedProjectFormData
  );

  console.log("IS EQUAL");
  console.log(isEqual);

  // const requestedProjectData = {
  //   ...rest,
  //   projectOwner: {
  //     connectOrCreate: {
  //       where: {
  //         email: projectOwner.email,
  //       },
  //       create: projectOwner,
  //     },
  //   },
  //   primaryTechnicalLead: {
  //     connectOrCreate: {
  //       where: {
  //         email: primaryTechnicalLead.email,
  //       },
  //       create: primaryTechnicalLead,
  //     },
  //   },
  //   secondaryTechnicalLead: secondaryTechnicalLead
  //     ? {
  //         connectOrCreate: {
  //           where: {
  //             email: secondaryTechnicalLead.email,
  //           },
  //           create: secondaryTechnicalLead,
  //         },
  //       }
  //     : undefined,
  // };

  // let request: PrivateCloudRequest;

  // try {
  //   request = await prisma.privateCloudRequest.update({
  //     where: {
  //       id: requestId,
  //       decisionStatus: DecisionStatus.PENDING,
  //     },
  //     data: {
  //       decisionStatus: decision,
  //       comment,
  //       active: decision === DecisionStatus.APPROVED,
  //       decisionDate: new Date(),
  //       decisionMakerEmail: authEmail,
  //       requestedProject: {
  //         update: requestedProjectData,
  //       },
  //     },
  //     include: {
  //       project: {
  //         include: {
  //           projectOwner: true,
  //           primaryTechnicalLead: true,
  //           secondaryTechnicalLead: true,
  //         },
  //       },
  //       requestedProject: {
  //         include: {
  //           projectOwner: true,
  //           primaryTechnicalLead: true,
  //           secondaryTechnicalLead: true,
  //         },
  //       },
  //     },
  //   });
  // } catch (e) {
  //   if (e instanceof Prisma.PrismaClientKnownRequestError) {
  //     if (e.code === "P2025") {
  //       throw new Error("Request not found or already has a decision.");
  //     }
  //   }
  //   throw e;
  // }

  // if (request.type === "DELETE") {
  //   throw Error("Delete is dissabled");
  //   return;
  // }

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

  // return request;
}
