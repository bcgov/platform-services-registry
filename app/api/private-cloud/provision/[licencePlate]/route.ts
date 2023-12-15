import { NextRequest, NextResponse } from 'next/server';
import { DecisionStatus, Prisma, PrivateCloudRequest, PrivateCloudRequestedProject } from '@prisma/client';
import prisma from '@/lib/prisma';
import { string, z } from 'zod';
import { PrivateCloudRequestedProjectWithContacts } from '@/nats/privateCloud';
import { sendProvisionedEmails } from '@/ches/private-cloud/emailHandler';

export type PrivateCloudRequestWithRequestedProject = Prisma.PrivateCloudRequestGetPayload<{
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
    const request: PrivateCloudRequestWithRequestedProject | null = await prisma.privateCloudRequest.findFirst({
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

    const updateRequest = prisma.privateCloudRequest.update({
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
    const upsertProject = prisma.privateCloudProject.upsert({
      where: {
        licencePlate: licencePlate,
      },
      update: requestedProject as PrivateCloudRequestedProject,
      create: requestedProject as PrivateCloudRequestedProject,
    });

    await prisma.$transaction([updateRequest, upsertProject]);

    console.log(`Successfully marked ${licencePlate} as provisioned.`);

    // revalidatePath('/private-cloud/requests', 'page');
    // revalidatePath('/private-cloud/products', 'page');

    sendProvisionedEmails(request.requestedProject as PrivateCloudRequestedProjectWithContacts);

    return new NextResponse(`Successfully marked ${licencePlate} as provisioned.`, { status: 200 });
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}
