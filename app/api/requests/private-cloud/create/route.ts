import { NextRequest, NextResponse } from "next/server";
import {
  ProjectStatus,
  RequestType,
  DecisionStatus,
  DefaultCpuOptions,
  DefaultMemoryOptions,
  DefaultStorageOptions,
  Cluster,
  Ministry,
  User
} from "@prisma/client";
import { CommonComponentsSchema, UserSchema } from "@/schema";
import { Prisma } from "@prisma/client";
import generateLicensePlate from "@/lib/generateLicencePlate";
import { string, number, z } from "zod";
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

const BodySchema = z.object({
  name: string(),
  description: string(),
  cluster: z.nativeEnum(Cluster),
  ministry: z.nativeEnum(Ministry),
  commonComponents: CommonComponentsSchema,
  projectOwner: UserSchema,
  primaryTechnicalLead: UserSchema,
  secondaryTechnicalLead: UserSchema.optional()
});

type Body = z.infer<typeof BodySchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const parsedBody = BodySchema.safeParse(req.body);

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const { projectOwner, primaryTechnicalLead, secondaryTechnicalLead } =
    parsedBody.data;

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
    cpu: DefaultCpuOptions.CpuRequest_0_5Limit_1_5,
    memory: DefaultMemoryOptions.MemoryRequest_2Limit_4,
    storage: DefaultStorageOptions.Storage_1
  };

  let createRequest;

  try {
    createRequest = await prisma.privateCloudRequest.create({
      data: {
        type: RequestType.Create,
        decisionStatus: DecisionStatus.Pending,
        active: true,
        createdByEmail: authEmail,
        licencePlate,
        requestedProject: {
          create: {
            name: args.name,
            description: args.description,
            cluster: args.cluster,
            ministry: args.ministry,
            status: ProjectStatus.Active,
            licencePlate: licencePlate,
            commonComponents: args.commonComponents,
            productionQuota: defaultQuota,
            testQuota: defaultQuota,
            toolsQuota: defaultQuota,
            developmentQuota: defaultQuota,
            projectOwner: {
              connectOrCreate: {
                where: {
                  email: args.projectOwner.email
                },
                create: args.projectOwner
              }
            },
            primaryTechnicalLead: {
              connectOrCreate: {
                where: {
                  email: args.primaryTechnicalLead.email
                },
                create: args.primaryTechnicalLead
              }
            },
            secondaryTechnicalLead: args.secondaryTechnicalLead
              ? {
                  connectOrCreate: {
                    where: {
                      email: args.secondaryTechnicalLead.email
                    },
                    create: args.secondaryTechnicalLead
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

  sendCreateRequestEmails(createRequest.requestedProject);

  return createRequest;
}

export default privateCloudProjectRequest;
