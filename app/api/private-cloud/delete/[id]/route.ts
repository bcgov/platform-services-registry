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
import prisma from '@/lib/prisma';
import { string, z } from 'zod';
// import { sendDeleteRequestEmails } from "../../ches/emailHandlers.js";

const ParamsSchema = z.object({
  id: string(),
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response('You do not have the required credentials.', {
      status: 401,
    });
  }

  const { email: authEmail, roles: authRoles } = session.user;

  const parsedParams = ParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return new Response(parsedParams.error.message, { status: 400 });
  }

  const { id: projectId } = parsedParams.data;

  let createRequest: PrivateCloudRequest;

  try {
    const project: PrivateCloudProject | null = await prisma.privateCloudProject.findUnique({
      where: {
        id: projectId,
      },
    });

    if (!project) {
      throw new Error('Project does not exist.');
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
      !users.map((user) => user.email).includes(authEmail) &&
      !(authRoles.includes('admin') || authRoles.includes(`ministry-${project.ministry.toLocaleLowerCase()}-admin`))
    ) {
      throw new Error('You need to be a contact on this project in order to delete it.');
    }

    project.status = ProjectStatus.INACTIVE;

    createRequest = await prisma.privateCloudRequest.create({
      data: {
        type: RequestType.DELETE,
        decisionStatus: DecisionStatus.PENDING,
        active: true,
        createdByEmail: authEmail,
        licencePlate: project.licencePlate,
        requestedProject: {
          create: project,
        },
        project: {
          connect: {
            id: projectId,
          },
        },
      },
      include: {
        project: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true,
          },
        },
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new Error('There is already an active request for this project.');
      }
    }
    throw e;
  }

  // sendDeleteRequestEmails(createRequest.project);

  return new Response('Success', { status: 200 });
}
