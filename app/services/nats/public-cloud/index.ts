import prisma from '@/core/prisma';
import { getAccountCodingString } from '@/helpers/billing';
import { formatFullName } from '@/helpers/user';
import { Prisma } from '@/prisma/types';
import { PublicCloudRequestDetail } from '@/types/public-cloud';

function prepareUser(user?: Prisma.UserGetPayload<null> | null) {
  if (!user)
    return {
      name: '',
      email: '',
      providerUserId: '',
    };

  return {
    name: formatFullName(user),
    email: user.email,
    providerUserId: user.providerUserId,
  };
}

// Create a test env variable that prefix the namespace name with "t"
export default async function createPublicCloudNatsMessage(
  request: Pick<PublicCloudRequestDetail, 'id' | 'type' | 'project' | 'decisionData'>,
) {
  const decisionData = request.decisionData;
  const currentProject = request.project;

  const billing = await prisma.publicCloudBilling.findFirst({
    where: { licencePlate: decisionData.licencePlate, signed: true, approved: true },
    orderBy: { createdAt: Prisma.SortOrder.desc },
  });

  return {
    project_set_info: {
      licence_plate: decisionData.licencePlate,
      ministry_name: decisionData.ministry,
      request_type: request.type,
      project_name: decisionData.name,
      account_coding: billing?.accountCoding ? getAccountCodingString(billing.accountCoding, '') : '',
      budgets: decisionData.budget,
      enterprise_support: {
        prod: true,
        test: false,
        dev: false,
        tools: false,
      },
      current_environments: currentProject?.environmentsEnabled
        ? {
            dev: currentProject.environmentsEnabled.development,
            test: currentProject.environmentsEnabled.test,
            prod: currentProject.environmentsEnabled.production,
            tools: currentProject.environmentsEnabled.tools,
          }
        : null,
      requested_environments: {
        dev: decisionData.environmentsEnabled.development,
        test: decisionData.environmentsEnabled.test,
        prod: decisionData.environmentsEnabled.production,
        tools: decisionData.environmentsEnabled.tools,
      },
      requested_product_owner: prepareUser(decisionData.projectOwner),
      current_product_owner: !currentProject ? null : prepareUser(currentProject.projectOwner),
      requested_expense_authority: prepareUser(decisionData.expenseAuthority),
      current_expense_authority: !currentProject ? null : prepareUser(currentProject.expenseAuthority),
      requested_tech_leads: [
        prepareUser(decisionData.primaryTechnicalLead),
        prepareUser(decisionData.secondaryTechnicalLead),
      ].filter((techLead) => Boolean(techLead.email)),
      current_tech_leads: !currentProject
        ? null
        : [
            prepareUser(currentProject.primaryTechnicalLead),
            prepareUser(currentProject?.secondaryTechnicalLead),
          ].filter((techLead) => Boolean(techLead.email)),
    },
  };
}
