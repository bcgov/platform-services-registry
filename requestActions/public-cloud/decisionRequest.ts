import { DecisionStatus, Prisma, ProjectStatus } from '@prisma/client';
import prisma from '@/core/prisma';
import { PublicCloudEditRequestBody } from '@/schema';

export type PublicCloudRequestWithProjectAndRequestedProject = Prisma.PublicCloudRequestGetPayload<{
  include: {
    project: {
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

export type PublicCloudRequestWithRequestedProject = Prisma.PublicCloudRequestGetPayload<{
  include: {
    requestedProject: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
  };
}>;

export default async function makeDecisionRequest(
  licencePlate: string,
  decision: DecisionStatus,
  decisionComment: string | undefined,
  formData: PublicCloudEditRequestBody,
  authEmail: string,
): Promise<PublicCloudRequestWithProjectAndRequestedProject> {
  // Get the request
  const request: PublicCloudRequestWithRequestedProject | null = await prisma.publicCloudRequest.findFirst({
    where: {
      licencePlate,
      active: true,
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
    throw new Error('Request not found.');
  }

  const {
    id: _,
    projectOwnerId,
    primaryTechnicalLeadId,
    secondaryTechnicalLeadId,
    ...userRequestedProject
  } = request.requestedProject;
  // Update the request with the data passed in from the form.
  // Since the admin has the ablilty to modify the request, we put these changes into the adminRequestedProject field
  // that is the new requested project from the admin form. The adminRequestedProject may be the same as the requested
  // project if the admin did not change anything.
  return prisma.publicCloudRequest.update({
    where: {
      id: request.id,
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
    data: {
      decisionStatus: decision,
      decisionComment: decisionComment,
      active: decision === DecisionStatus.APPROVED,
      decisionDate: new Date(),
      decisionMakerEmail: authEmail,
      requestedProject: {
        update: {
          ...formData,
          status: ProjectStatus.ACTIVE,
          licencePlate: request.licencePlate,
          projectOwner: {
            connectOrCreate: {
              where: {
                email: formData.projectOwner.email,
              },
              create: formData.projectOwner,
            },
          },
          primaryTechnicalLead: {
            connectOrCreate: {
              where: {
                email: formData.primaryTechnicalLead.email,
              },
              create: formData.primaryTechnicalLead,
            },
          },
          secondaryTechnicalLead: formData.secondaryTechnicalLead
            ? {
                connectOrCreate: {
                  where: {
                    email: formData.secondaryTechnicalLead.email,
                  },
                  create: formData.secondaryTechnicalLead,
                },
              }
            : undefined,
        },
      },
    },
  });
}
