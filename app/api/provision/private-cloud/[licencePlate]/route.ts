import { NextRequest, NextResponse } from "next/server";
import {
  DecisionStatus,
  PrivateCloudRequest,
  PrivateCloudRequestedProject
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { string, z } from "zod";
// import { sendProvisionedEmails } from "../ches/emailHandlers.js";

// See this for pagination: https://github.com/Puppo/it-s-prisma-time/blob/10-pagination/src/index.ts

export type PrivateCloudRequestWithAllRelations =
  Prisma.PrivateCloudRequestGetPayload<{
    include: {
      project: {
        include: {
          projectOwner: true;
          primaryTechnicalLead: true;
          secondaryTechnicalLead: true;
        };
      };
      adminRequestedProject: {
        include: {
          projectOwner: true;
          primaryTechnicalLead: true;
          secondaryTechnicalLead: true;
        };
      };
      requestedProject: {
        include: {
          projectOwner: true;
          primaryTechnicalLead: true;
          secondaryTechnicalLead: true;
        };
      };
    };
  }>;

const GetParamsSchema = z.object({
  licencePlate: string()
});

type Params = z.infer<typeof GetParamsSchema>;

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const parsedParams = GetParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  const { licencePlate } = params;

  try {
    const request: PrivateCloudRequestWithAllRelations | null =
      await prisma.privateCloudRequest.findUnique({
        where: {
          decisionStatus: DecisionStatus.APPROVED,
          licencePlate_active: {
            licencePlate: licencePlate,
            active: true
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
          adminRequestedProject: {
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

    if (!request) {
      console.log("No provision request found for project: " + licencePlate);
      return new NextResponse("No requetst found for this licece plate.", {
        status: 404
      });
    }

    if (!request.requestedProject || !request.adminRequestedProject) {
      console.log(
        "Requested project or admin requested project not found for project: " +
          licencePlate
      );
      return new NextResponse(
        "Requested project or admin requested project not found.",
        { status: 404 }
      );
    }

    const updateRequest = prisma.privateCloudRequest.update({
      where: {
        id: request.id
      },
      data: {
        decisionStatus: DecisionStatus.PROVISIONED,
        active: false
      }
    });

    // Upsert the project with the requested project data. If admin requested project data exists, use that instead.
    const upsertProject = prisma.privateCloudProject.upsert({
      where: {
        licencePlate: licencePlate
      },
      update: (request.adminRequestedProject
        ? request.adminRequestedProject
        : request.requestedProject) as Prisma.PrivateCloudProjectUpdateInput,
      create: (request.adminRequestedProject
        ? request.adminRequestedProject
        : request.requestedProject) as Prisma.PrivateCloudProjectCreateInput
    });

    await prisma.$transaction([updateRequest, upsertProject]);

    // sendProvisionedEmails(request);
    console.log("Provisioned project: " + licencePlate);
    return new NextResponse(
      `Successfuly marked ${licencePlate} as provisioned.`,
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
