import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import {
  DecisionStatus,
  Prisma,
  PrivateCloudProject,
  PrivateCloudRequest,
  ProjectStatus,
  RequestType,
  User,
} from '@prisma/client';
import prisma from '@/core/prisma';
import { string, z } from 'zod';
import { sendDeleteRequestEmails } from '@/services/ches/private-cloud/emailHandler';
import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import openshiftDeletionCheck from '@/helpers/openshift';

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

  const existingRequest: PrivateCloudRequest | null = await prisma.privateCloudRequest.findFirst({
    where: {
      AND: [{ licencePlate }, { active: true }],
    },
  });

  if (existingRequest !== null) {
    return new Response('There is already an active request for this project.', { status: 500 });
  }

  const project: PrivateCloudProject | null = await prisma.privateCloudProject.findUnique({
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

  const deleteCheckList = await openshiftDeletionCheck(project.licencePlate, project.cluster);

  if (!Object.values(deleteCheckList).every((field) => field)) {
    return new Response(
      'This project is not deletable as it is not empty. Please delete all resources before deleting the project.',
    );
  }

  project.status = ProjectStatus.INACTIVE;

  const { id, ...rest } = project;

  const createRequest: PrivateCloudRequestWithRequestedProject = await prisma.privateCloudRequest.create({
    data: {
      type: RequestType.DELETE,
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

  return new Response('Success', { status: 200 });
}
