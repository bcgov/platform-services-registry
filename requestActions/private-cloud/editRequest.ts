import { RequestType, PrivateCloudRequest, DecisionStatus, PrivateCloudProject } from '@prisma/client';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { PrivateCloudEditRequestBody } from '@/schema';

export type PrivateCloudRequestWithProjectAndRequestedProject = Prisma.PrivateCloudRequestGetPayload<{
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

export default async function editRequest(
  licencePlate: string,
  formData: PrivateCloudEditRequestBody,
  authEmail: string,
): Promise<PrivateCloudRequestWithProjectAndRequestedProject> {
  // Get the current project that we are creating an edit request for
  const project: PrivateCloudProject | null = await prisma.privateCloudProject.findUnique({
    where: {
      licencePlate: licencePlate,
    },
    include: {
      projectOwner: true,
      primaryTechnicalLead: true,
      secondaryTechnicalLead: true,
    },
  });

  if (!project) {
    throw new Error('Project does not exist.');
  }

  // merge the form data with the existing project data
  const requestedProject = {
    ...formData,
    licencePlate: project.licencePlate,
    status: project.status,
    cluster: project.cluster,
    created: project.created,
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
  };

  // The edit request will requre manual admin approval if any of the quotas are being changed.
  const isQuotaChanged = !(
    JSON.stringify(formData.productionQuota) === JSON.stringify(project.productionQuota) &&
    JSON.stringify(formData.testQuota) === JSON.stringify(project.testQuota) &&
    JSON.stringify(formData.developmentQuota) === JSON.stringify(project.developmentQuota) &&
    JSON.stringify(formData.toolsQuota) === JSON.stringify(project.toolsQuota)
  );

  let decisionStatus: DecisionStatus;

  // If there is no quota change, the request is automatically approved
  if (isQuotaChanged) {
    decisionStatus = DecisionStatus.PENDING;
  } else {
    decisionStatus = DecisionStatus.APPROVED;
  }

  return prisma.privateCloudRequest.create({
    data: {
      type: RequestType.EDIT,
      decisionStatus: decisionStatus,
      active: true,
      createdByEmail: authEmail,
      licencePlate: project.licencePlate,
      requestedProject: {
        create: requestedProject,
      },
      userRequestedProject: {
        create: requestedProject,
      },
      project: {
        connect: {
          licencePlate: licencePlate,
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
      requestedProject: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
  });
}
