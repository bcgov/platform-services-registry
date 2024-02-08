import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import {
  DecisionStatus,
  PublicCloudProject,
  PublicCloudRequest,
  ProjectStatus,
  PublicCloudRequestType,
  User,
} from '@prisma/client';
import prisma from '@/lib/prisma';
import { string, z } from 'zod';
import { sendDeleteRequestEmails, sendAdminDeleteRequestEmails } from '@/ches/public-cloud/emailHandler';
import { PublicCloudRequestWithRequestedProject } from '@/requestActions/public-cloud/decisionRequest';

const ParamsSchema = z.object({
  licencePlate: string(),
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('You do not have the required credentials.', {
      status: 401,
    });
  }

  const { isAdmin, user, roles: authRoles } = session ?? {};
  const { email: authEmail } = user ?? {};

  const parsedParams = ParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return new Response(parsedParams.error.message, { status: 400 });
  }

  const { licencePlate } = parsedParams.data;

  const existingRequest: PublicCloudRequest | null = await prisma.publicCloudRequest.findFirst({
    where: {
      AND: [{ licencePlate }, { active: true }],
    },
  });

  if (existingRequest !== null) {
    return new Response('There is already an active request for this project.', { status: 500 });
  }

  const project: PublicCloudProject | null = await prisma.publicCloudProject.findUnique({
    where: {
      licencePlate,
    },
  });

  if (!project) {
    throw new Error('Product does not exist.');
  }

  const users: User[] = await prisma.user.findMany({
    where: {
      id: {
        in: [project.projectOwnerId, project.primaryTechnicalLeadId, project.secondaryTechnicalLeadId].filter(
          Boolean,
        ) as string[],
      },
    },
  });

  if (
    !users.map((usr) => usr.email).includes(authEmail) &&
    !(authRoles.includes('admin') || authRoles.includes(`ministry-${project.ministry.toLocaleLowerCase()}-admin`))
  ) {
    throw new Error('You need to be a contact on this project in order to delete it.');
  }

  project.status = ProjectStatus.INACTIVE;

  const { id, ...rest } = project;

  const createRequest: PublicCloudRequestWithRequestedProject = await prisma.publicCloudRequest.create({
    data: {
      type: PublicCloudRequestType.DELETE,
      decisionStatus: DecisionStatus.PENDING,
      active: true,
      createdByEmail: authEmail,
      licencePlate: project.licencePlate,
      requestedProject: {
        create: rest,
      },
      userRequestedProject: {
        create: rest,
      },
      project: {
        connect: {
          licencePlate,
        },
      },
    },
    include: {
      requestedProject: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
  });

  sendDeleteRequestEmails(createRequest.requestedProject);
  sendAdminDeleteRequestEmails(createRequest.requestedProject);

  return new Response('Success', { status: 200 });
}
