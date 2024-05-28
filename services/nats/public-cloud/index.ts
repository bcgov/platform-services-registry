import { Prisma, PublicCloudRequest, PublicCloudRequestedProject, RequestType } from '@prisma/client';

export type PublicCloudRequestedProjectWithContacts = Prisma.PublicCloudRequestedProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
    expenseAuthority: true;
  };
}>;

export type PublicCloudProjectWithContacts = Prisma.PublicCloudRequestedProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
    expenseAuthority: true;
  };
}>;

// Create a test env variable that prefix the namespace name with "t"
export default function createPublicCloudNatsMessage(
  requestType: RequestType,
  decisionData: PublicCloudRequestedProjectWithContacts,
  currentProject?: PublicCloudProjectWithContacts | null,
) {
  return {
    project_set_info: {
      licence_plate: decisionData.licencePlate,
      ministry_name: decisionData.ministry,
      request_type: requestType,
      project_name: decisionData.name,
      account_coding: decisionData.accountCoding,
      budgets: decisionData.budget,
      enterprise_support: {
        prod: true,
        test: false,
        dev: false,
        tools: false,
      },
      current_environments: currentProject?.environmentsEnabled ?? null,
      requested_environments: decisionData.environmentsEnabled,
      requested_product_owner: {
        name: `${decisionData.projectOwner.firstName} ${decisionData.projectOwner.lastName}`,
        email: decisionData.projectOwner.email,
      },
      current_product_owner: !currentProject
        ? null
        : {
            name: `${currentProject.projectOwner.firstName} ${currentProject.projectOwner.lastName}`,
            email: currentProject.projectOwner.email,
          },
      requested_expense_authority: {
        name: `${decisionData.expenseAuthority?.firstName} ${decisionData.expenseAuthority?.lastName}`,
        email: decisionData.expenseAuthority?.email,
      },
      current_expense_authority: !currentProject
        ? null
        : {
            name: `${currentProject.expenseAuthority?.firstName} ${currentProject.expenseAuthority?.lastName}`,
            email: currentProject.expenseAuthority?.email,
          },
      requested_tech_leads: [
        {
          name: `${decisionData.primaryTechnicalLead.firstName} ${decisionData.primaryTechnicalLead.lastName}`,
          email: decisionData.primaryTechnicalLead.email,
        },
        {
          name: `${decisionData?.secondaryTechnicalLead?.firstName} ${decisionData?.secondaryTechnicalLead?.lastName}`,
          email: decisionData?.secondaryTechnicalLead?.email,
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
