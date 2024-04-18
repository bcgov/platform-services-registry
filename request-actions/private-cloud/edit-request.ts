import { DecisionStatus, RequestType } from '@prisma/client';
import prisma from '@/core/prisma';
import { PrivateCloudEditRequestBody } from '@/schema';
import { upsertUsers } from '@/services/db/user';
import { isQuotaDowngrade } from '@/utils/number';

export default async function editRequest(
  licencePlate: string,
  formData: PrivateCloudEditRequestBody,
  authEmail: string,
) {
  // Get the current project that we are creating an edit request for
  const project = await prisma.privateCloudProject.findUnique({
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

  const { requestComment, ...rest } = formData;

  await upsertUsers([
    formData.projectOwner.email,
    formData.primaryTechnicalLead.email,
    formData.secondaryTechnicalLead?.email,
  ]);

  // merge the form data with the existing project data
  const requestedProject = {
    ...rest,
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

  // The edit request will require manual admin approval if any of the quotas are being changed.
  const isQuotaChanged = !(
    JSON.stringify(formData.productionQuota) === JSON.stringify(project.productionQuota) &&
    JSON.stringify(formData.testQuota) === JSON.stringify(project.testQuota) &&
    JSON.stringify(formData.developmentQuota) === JSON.stringify(project.developmentQuota) &&
    JSON.stringify(formData.toolsQuota) === JSON.stringify(project.toolsQuota)
  );

  let decisionStatus: DecisionStatus;

  // If there is no quota change or no quota upgrade, the request is automatically approved
  if (isQuotaChanged) {
    // If there is no quota upgrade, the request is automatically approved
    if (isQuotaDowngrade(formData, project as PrivateCloudEditRequestBody)) {
      decisionStatus = DecisionStatus.APPROVED;
    } else {
      decisionStatus = DecisionStatus.PENDING;
    }
  } else {
    decisionStatus = DecisionStatus.APPROVED;
  }

  return prisma.privateCloudRequest.create({
    data: {
      type: RequestType.EDIT,
      decisionStatus: decisionStatus,
      isQuotaChanged,
      active: true,
      createdByEmail: authEmail,
      licencePlate: project.licencePlate,
      requestComment,
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
