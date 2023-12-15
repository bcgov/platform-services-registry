import { NextRequest, NextResponse } from 'next/server';
import { DecisionStatus, Prisma, PublicCloudRequestedProject } from '@prisma/client';
import prisma from '@/lib/prisma';
import { string, z } from 'zod';
import { PublicCloudRequestedProjectWithContacts } from '@/nats/publicCloud';
import { sendProvisionedEmails } from '@/ches/public-cloud/emailHandler';

export type PublicCloudRequestWithRequestedProject = Prisma.PublicCloudRequestGetPayload<{
  include: {
    requestedProject: true;
  };
}>;

const ParamsSchema = z.object({
  licencePlate: string(),
});

type Params = z.infer<typeof ParamsSchema>;

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const parsedParams = ParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  const { licencePlate } = params;

  try {
    const request: PublicCloudRequestWithRequestedProject | null = await prisma.publicCloudRequest.findFirst({
      where: {
        decisionStatus: DecisionStatus.APPROVED,
        licencePlate,
        active: true,
      },
      include: {
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
      console.log('No provision request found for project: ' + licencePlate);
      return new NextResponse('No requetst found for this licece plate.', {
        status: 404,
      });
    }

    const updateRequest = prisma.publicCloudRequest.update({
      where: {
        id: request.id,
      },
      data: {
        decisionStatus: DecisionStatus.PROVISIONED,
        active: false,
      },
    });

    const { id, ...requestedProject } = request.requestedProject;

    // Upsert the project with the requested project data. If admin requested project data exists, use that instead.
    const upsertProject = prisma.publicCloudProject.upsert({
      where: {
        licencePlate: licencePlate,
      },
      update: requestedProject as PublicCloudRequestedProject,
      create: requestedProject as PublicCloudRequestedProject,
    });

    await prisma.$transaction([updateRequest, upsertProject]);

    sendProvisionedEmails(requestedProject as PublicCloudRequestedProjectWithContacts);
    return new NextResponse(`Successfully marked ${licencePlate} as provisioned.`, { status: 200 });
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}
