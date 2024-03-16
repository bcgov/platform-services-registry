import { NextRequest, NextResponse } from 'next/server';
import { $Enums, DecisionStatus } from '@prisma/client';
import prisma from '@/core/prisma';
import { string, z } from 'zod';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';
import { sendProvisionedEmails, sendDeleteRequestApprovalEmails } from '@/services/ches/public-cloud/email-handler';
import { wrapAsync } from '@/helpers/runtime';

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
    const request = await prisma.publicCloudRequest.findFirst({
      where: {
        decisionStatus: DecisionStatus.APPROVED,
        licencePlate,
        active: true,
      },
      include: {
        requestedProject: true,
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
    const filter = { licencePlate };
    const upsertProject =
      request.type === $Enums.RequestType.DELETE
        ? prisma.publicCloudProject.update({
            where: filter,
            data: { status: $Enums.ProjectStatus.INACTIVE },
          })
        : prisma.publicCloudProject.upsert({
            where: filter,
            update: requestedProject,
            create: requestedProject,
          });

    await prisma.$transaction([updateRequest, upsertProject]);

    // Note: For some reason this information cannot be retrieved from the transaction above without failing the test
    const project = await prisma.publicCloudProject.findUnique({
      where: {
        licencePlate,
      },
      include: {
        projectOwner: true,
        primaryTechnicalLead: true,
        secondaryTechnicalLead: true,
        expenseAuthority: true,
      },
    });

    wrapAsync(() => {
      if (request.type === $Enums.RequestType.DELETE) {
        sendDeleteRequestApprovalEmails(project as PublicCloudRequestedProjectWithContacts);
      } else sendProvisionedEmails(project as PublicCloudRequestedProjectWithContacts);
    });

    return new NextResponse(`Successfully marked ${licencePlate} as provisioned.`, { status: 200 });
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}
