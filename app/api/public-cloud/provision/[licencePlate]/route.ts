import { NextRequest, NextResponse } from "next/server";
import {
  DecisionStatus,
  PublicCloudRequest,
  PublicCloudRequestedProject,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { string, z } from "zod";

const GetParamsSchema = z.object({
  licencePlate: string(),
});

type Params = z.infer<typeof GetParamsSchema>;

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const parsedParams = GetParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  const { licencePlate } = params;

  try {
    const request: PublicCloudRequest | null =
      await prisma.publicCloudRequest.findFirst({
        where: {
          licencePlate,
          active: true,
          decisionStatus: DecisionStatus.APPROVED,
        },
        include: {
          project: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
              secondaryTechnicalLead: true,
            },
          },
          requestedProject: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
              secondaryTechnicalLead: true,
            },
          },
        },
      });

    if (!request) {
      console.log("No provision request found for project: " + licencePlate);
      return new NextResponse("No requetst found for this licece plate.", {
        status: 404,
      });
    }

    const requestedProject: PublicCloudRequestedProject | null =
      await prisma.publicCloudRequestedProject.findFirst({
        where: {
          id: request.requestedProjectId,
        },
      });

    if (!requestedProject) {
      // Handle this case: return an error or create some default data
      return new NextResponse("Requested project not found.", { status: 404 });
    }

    await prisma.$transaction(async (prisma) => {
      const upsertProject = await prisma.publicCloudProject.upsert({
        where: {
          licencePlate: licencePlate,
        },
        update: requestedProject,
        create: requestedProject,
      });

      const updateRequest = await prisma.publicCloudRequest.update({
        where: {
          requestedProjectId: requestedProject.id,
        },
        data: {
          decisionStatus: DecisionStatus.PROVISIONED,
          active: false,
          projectId: upsertProject.id, /// Set the ID incase it is a create request
        },
      });

      return updateRequest;
    });

    // sendProvisionedEmails(request);
    console.log(`Provisioned project: ${licencePlate}`);
    return new NextResponse(
      `Successfuly marked ${licencePlate} as provisioned.`,
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
