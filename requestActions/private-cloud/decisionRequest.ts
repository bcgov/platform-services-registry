import { ProjectStatus, DecisionStatus, Cluster } from "@prisma/client";
import prisma from "@/lib/prisma";
import { EditRequestBody } from "@/schema";
import sendPrivateCloudNatsMessage from "@/nats/privateCloud";
import { Prisma } from "@prisma/client";

export type PrivateCloudRequestWithRequestedProject =
  Prisma.PrivateCloudRequestGetPayload<{
    include: {
      project: true;
      requestedProject: {
        include: {
          projectOwner: true;
          primaryTechnicalLead: true;
          secondaryTechnicalLead: true;
        };
      };
    };
  }>;

export type PrivateCloudRequestWithAdminRequestedProject =
  Prisma.PrivateCloudRequestGetPayload<{
    include: {
      adminRequestedProject: {
        include: {
          projectOwner: true;
          primaryTechnicalLead: true;
          secondaryTechnicalLead: true;
        };
      };
    };
  }>;

export default async function decisionRequest(
  requestId: string,
  decision: DecisionStatus,
  comment: string | undefined,
  formData: EditRequestBody,
  authEmail: string
): Promise<PrivateCloudRequestWithAdminRequestedProject> {
  // Get the request
  const request: PrivateCloudRequestWithRequestedProject | null =
    await prisma.privateCloudRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        project: true,
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
    throw new Error("Request not found.");
  }

  // Update the request with the data passed in from the form.
  // Since the admin has the ablilty to modify the request, we put these changes into the adminRequestedProject model
  // that is the new requested project from the admin form. The adminRequestedProject may be the same as the requested
  // project if the admin did not change anything.
  const decisionRequest: PrivateCloudRequestWithAdminRequestedProject | null =
    await prisma.privateCloudRequest.update({
      where: {
        id: requestId,
        decisionStatus: DecisionStatus.PENDING,
      },
      include: {
        adminRequestedProject: {
          include: {
            projectOwner: true,
            primaryTechnicalLead: true,
            secondaryTechnicalLead: true,
          },
        },
      },
      data: {
        decisionStatus: decision,
        humanComment: comment,
        active: decision === DecisionStatus.APPROVED,
        decisionDate: new Date(),
        decisionMakerEmail: authEmail,
        adminRequestedProject: {
          create: {
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

  if (
    decisionRequest === null ||
    decisionRequest.adminRequestedProject === null
  ) {
    throw new Error("Unable to update request.");
  }

  return decisionRequest;
}
