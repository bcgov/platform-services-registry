import { NextRequest, NextResponse } from "next/server";
import {
  DecisionStatus,
  PrivateCloudRequest,
  PrivateCloudRequestedProject
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { string, z } from "zod";
// import { sendProvisionedEmails } from "../ches/emailHandlers.js";

// See this for pagination: https://github.com/Puppo/it-s-prisma-time/blob/10-pagination/src/index.ts

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
    const request: PrivateCloudRequest | null =
      await prisma.privateCloudRequest.findFirst({
        where: {
          licencePlate: licencePlate,
          active: true,
          decisionStatus: DecisionStatus.APPROVED
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

    if (!request) {
      console.log("No provision request found for project: " + licencePlate);
      return new NextResponse("No requetst found for this licece plate.", {
        status: 404
      });
    }

    const requestedProject: PrivateCloudRequestedProject | null =
      await prisma.privateCloudRequestedProject.findFirst({
        where: {
          id: request.requestedProjectId
        }
      });

    if (!requestedProject) {
      // Handle this case: return an error or create some default data
      return new NextResponse("Requested project not found.", { status: 404 });
    }

    const updateRequest = prisma.privateCloudRequest.update({
      where: {
        requestedProjectId: requestedProject.id
      },
      data: {
        decisionStatus: DecisionStatus.PROVISIONED,
        active: false
      }
    });

    const upsertProject = prisma.privateCloudProject.upsert({
      where: {
        licencePlate: licencePlate
      },
      update: requestedProject,
      create: requestedProject
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
