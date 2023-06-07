import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  ProjectStatus,
  RequestType,
  DecisionStatus,
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
  PrivateCloudRequest
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import generateLicensePlate from "@/lib/generateLicencePlate";
import {
  CreateRequestBodySchema,
  CreateRequestBody,
  UserInput
} from "@/schema";
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({
      message: "You do not have the required credentials."
    });
  }

  const { email: authEmail, roles: authRoles } = session.user;

  const parsedBody = CreateRequestBodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const data: CreateRequestBody = parsedBody.data;

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

  const licencePlate = generateLicensePlate();

  const defaultQuota = {
    cpu: DefaultCpuOptions.CPU_REQUEST_0_5_LIMIT_1_5,
    memory: DefaultMemoryOptions.MEMORY_REQUEST_2_LIMIT_4,
    storage: DefaultStorageOptions.STORAGE_1
  };

  let createRequest: PrivateCloudRequest;

  try {
    createRequest = await prisma.privateCloudRequest.create({
      data: {
        type: RequestType.CREATE,
        decisionStatus: DecisionStatus.PENDING,
        active: true,
        createdByEmail: authEmail,
        licencePlate,
        requestedProject: {
          create: {
            name: data.name,
            description: data.description,
            cluster: data.cluster,
            ministry: data.ministry,
            status: ProjectStatus.ACTIVE,
            licencePlate: licencePlate,
            commonComponents: data.commonComponents,
            productionQuota: defaultQuota,
            testQuota: defaultQuota,
            toolsQuota: defaultQuota,
            developmentQuota: defaultQuota,
            projectOwner: {
              connectOrCreate: {
                where: {
                  email: projectOwner.email
                },
                create: projectOwner
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
          }
        }
      },
      include: {
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
      throw new Error(e.message);
    }
    throw e;
  }

  // sendCreateRequestEmails(createRequest.requestedProject);

  return createRequest;
}
