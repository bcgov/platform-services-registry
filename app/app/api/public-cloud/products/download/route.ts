import { GlobalRole } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { getAccountCodingString } from '@/helpers/billing';
import { formatFullName } from '@/helpers/user';
import { EventType, PublicCloudBilling } from '@/prisma/client';
import { createEvent, getPublicCloudAccountCodingByLicencePlates, searchPublicCloudProducts } from '@/services/db';
import { getOrganizationMap } from '@/services/db/organization';
import { formatDateSimple } from '@/utils/js';
import { publicCloudProductSearchNoPaginationBodySchema } from '@/validation-schemas/public-cloud';

export const POST = createApiHandler({
  roles: [GlobalRole.User],
  validations: { body: publicCloudProductSearchNoPaginationBodySchema },
})(async ({ session, body }) => {
  const searchProps = {
    page: 1,
    pageSize: 10000,
    ...body,
  };

  const { docs, totalCount } = await searchPublicCloudProducts({
    ...searchProps,
    session,
  });

  if (docs.length === 0) {
    return NoContent();
  }

  const accountCodingMap = new Map<string, PublicCloudBilling['accountCoding']>();

  if (session.permissions.viewPublicCloudBilling) {
    const billings = await getPublicCloudAccountCodingByLicencePlates(docs.map((project) => project.licencePlate));

    for (const billing of billings) {
      if (!accountCodingMap.has(billing.licencePlate)) {
        accountCodingMap.set(billing.licencePlate, billing.accountCoding);
      }
    }
  }

  const orgMap = await getOrganizationMap();

  const formattedData = docs.map((project) => {
    const org = orgMap[project.organizationId];
    const accountCoding = accountCodingMap.get(project.licencePlate);
    return {
      Name: project.name,
      Description: project.description,
      Ministry: org.name,
      Provider: project.provider,
      'Reasons for selecting cloud provider': project.providerSelectionReasons.join(', '),
      'Description of selected reasons': project.providerSelectionReasonsNote,
      'Project Owner email': project.projectOwner.email,
      'Project Owner name': formatFullName(project.projectOwner),
      'Primary Technical Lead email': project.primaryTechnicalLead.email,
      'Primary Technical Lead name': formatFullName(project.primaryTechnicalLead),
      'Secondary Technical Lead email': project.secondaryTechnicalLead ? project.secondaryTechnicalLead.email : '',
      'Secondary Technical Lead name': formatFullName(project.secondaryTechnicalLead),
      'Create date': formatDateSimple(project.createdAt),
      'Update date': formatDateSimple(project.updatedAt),
      'Licence plate': project.licencePlate,
      Status: project.status,
      Repositories: (project.repositories ?? []).map((repository) => repository.url).join('; '),
      Budget: `Dev: ${project.budget?.dev ?? 0}, Test: ${project.budget?.test ?? 0}, Prod: ${
        project.budget?.prod ?? 0
      }, Tools: ${project.budget?.tools ?? 0}`,
      ...(session.permissions.viewPublicCloudBilling
        ? {
            'Account coding': accountCoding ? getAccountCodingString(accountCoding, '') : '',
          }
        : {}),
    };
  });

  await createEvent(EventType.EXPORT_PUBLIC_CLOUD_PRODUCT, session.user.id, searchProps);

  return CsvResponse(formattedData, 'public-cloud-products.csv');
});
