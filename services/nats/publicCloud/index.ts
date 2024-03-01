import { Prisma, PublicCloudRequest, PublicCloudRequestedProject, RequestType } from '@prisma/client';

export type PublicCloudRequestedProjectWithContacts = Prisma.PublicCloudRequestedProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
  };
}>;

export type PublicCloudProjectWithContacts = Prisma.PublicCloudRequestedProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
  };
}>;

// Create a test env variable that prefix the namespace name with "t"
export default function createPublicCloudNatsMessage(
  requestType: RequestType,
  requestedProject: PublicCloudRequestedProjectWithContacts,
  currentProject?: PublicCloudProjectWithContacts | null,
) {
  return {
    project_set_info: {
      licence_plate: requestedProject.licencePlate,
      ministry_name: requestedProject.ministry,
      request_type: requestType,
      project_name: requestedProject.name,
      account_coding: requestedProject.accountCoding,
      budgets: requestedProject.budget,
      enterprise_support: {
        prod: true,
        test: false,
        dev: false,
        tools: false,
      },
      requested_product_owner: {
        name: `${requestedProject.projectOwner.firstName} ${requestedProject.projectOwner.lastName}`,
        email: requestedProject.projectOwner.email,
      },
      current_product_owner: !currentProject
        ? null
        : {
            name: `${currentProject.projectOwner.firstName} ${currentProject.projectOwner.lastName}`,
            email: currentProject.projectOwner.email,
          },

      requested_tech_leads: [
        {
          name: `${requestedProject.primaryTechnicalLead.firstName} ${requestedProject.primaryTechnicalLead.lastName}`,
          email: requestedProject.primaryTechnicalLead.email,
        },
        {
          name: `${requestedProject?.secondaryTechnicalLead?.firstName} ${requestedProject?.secondaryTechnicalLead?.lastName}`,
          email: requestedProject?.secondaryTechnicalLead?.email,
        },
      ].filter((techLead) => Boolean(techLead.email)),
      current_tech_leads: !currentProject
        ? null
        : [
            {
              name: `${currentProject.primaryTechnicalLead.firstName} ${currentProject.primaryTechnicalLead.lastName}`,
              email: currentProject.primaryTechnicalLead.email,
            },
            {
              name: `${currentProject?.secondaryTechnicalLead?.firstName} ${currentProject?.secondaryTechnicalLead?.lastName}`,
              email: currentProject?.secondaryTechnicalLead?.email,
            },
          ].filter((techLead) => Boolean(techLead.email)),
    },
  };
}
