import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  RequestType,
  PrivateCloudRequest,
  DecisionStatus,
  PrivateCloudProject
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { EditRequestBodySchema, EditRequestBody, UserInput } from "@/schema";
import { string, z } from "zod";
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

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

  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = EditRequestBodySchema.safeParse(req.body);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const data: EditRequestBody = parsedBody.data;
  const { id: projectId } = parsedParams.data;

  const {
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead
  }: {
    projectOwner: UserInput;
    primaryTechnicalLead: UserInput;
    secondaryTechnicalLead?: UserInput;
  } = data;

  if (
    ![
      projectOwner.email,
      primaryTechnicalLead.email,
      secondaryTechnicalLead?.email
    ].includes(authEmail) &&
    !authRoles.includes("admin")
  ) {
    throw new Error(
      "You need to assign yourself to this project in order to create it."
    );
  }

  let editRequest: PrivateCloudRequest;
  let decisionStatus: DecisionStatus;

  try {
    const existingRequest: PrivateCloudRequest | null =
      await prisma.privateCloudRequest.findFirst({
        where: {
          AND: [{ projectId: projectId }, { active: true }]
        }
      });

    if (existingRequest !== null) {
      throw new Error(
        "This project already has an active request or it does not exist."
      );
    }

    const project: PrivateCloudProject | null =
      await prisma.privateCloudProject.findUnique({
        where: {
          id: projectId
        },
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true
        }
      });

    if (!project) {
      throw new Error("Project does not exist.");
    }

    const requestedProject = {
      name: data.name,
      description: data.description,
      cluster: project.cluster,
      ministry: data.ministry,
      status: project.status,
      licencePlate: project.licencePlate,
      commonComponents: data.commonComponents,
      productionQuota: data.productionQuota,
      testQuota: data.testQuota,
      toolsQuota: data.toolsQuota,
      developmentQuota: data.developmentQuota,
      profileId: project.profileId || null,
      created: project.created,
      projectOwner: {
        connectOrCreate: {
          where: {
            email: data.projectOwner.email
          },
          create: data.projectOwner
        }
      },
      primaryTechnicalLead: {
        connectOrCreate: {
          where: {
            email: primaryTechnicalLead.email
          },
          create: primaryTechnicalLead
        }
      },
      secondaryTechnicalLead: secondaryTechnicalLead
        ? {
            connectOrCreate: {
              where: {
                email: secondaryTechnicalLead.email
              },
              create: secondaryTechnicalLead
            }
          }
        : undefined
    };

    const isQuotaChanged = !(
      JSON.stringify(data.productionQuota) ===
        JSON.stringify(data.productionQuota) &&
      JSON.stringify(data.testQuota) === JSON.stringify(data.testQuota) &&
      JSON.stringify(data.developmentQuota) ===
        JSON.stringify(data.developmentQuota) &&
      JSON.stringify(data.toolsQuota) === JSON.stringify(data.toolsQuota)
    );

    // If any of the quotas are being changed, the request needs admin approval
    if (isQuotaChanged) {
      decisionStatus = DecisionStatus.PENDING;
    } else {
      decisionStatus = DecisionStatus.APPROVED;
    }

    editRequest = await prisma.privateCloudRequest.create({
      data: {
        type: RequestType.EDIT,
        decisionStatus: decisionStatus,
        active: true,
        createdByEmail: authEmail,
        licencePlate: project.licencePlate,
        requestedProject: {
          create: requestedProject
        },
        project: {
          connect: {
            id: projectId
          }
        }
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

  return editRequest;
}
