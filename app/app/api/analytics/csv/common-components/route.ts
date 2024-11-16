import { CommonComponentsOptions, ProjectStatus } from '@prisma/client';
import _sum from 'lodash-es/sum';
import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import prisma from '@/core/prisma';
import { CsvResponse } from '@/core/responses';

const apiHandler = createApiHandler({
  permissions: [GlobalPermissions.ViewGeneralAnalytics],
});

function commonComponentToText(item: CommonComponentsOptions) {
  if (item.implemented) return 'implemented';
  if (item.planningToUse) return 'planning to use';
  return '';
}
export const GET = apiHandler(async () => {
  const products = await prisma.privateCloudProject.findMany({
    where: { status: ProjectStatus.ACTIVE },
    select: {
      name: true,
      licencePlate: true,
      commonComponents: true,
    },
  });

  return CsvResponse(
    products.map((row) => {
      return {
        'Product name': row.name,
        'Licence Plate': row.licencePlate,
        'Address and Geolocation': commonComponentToText(row.commonComponents.addressAndGeolocation),
        'Workflow Management': commonComponentToText(row.commonComponents.workflowManagement),
        'Form Design and Submission': commonComponentToText(row.commonComponents.formDesignAndSubmission),
        'Identity management': commonComponentToText(row.commonComponents.identityManagement),
        'Payment services': commonComponentToText(row.commonComponents.paymentServices),
        'Document Management': commonComponentToText(row.commonComponents.documentManagement),
        'End user notification and subscription service': commonComponentToText(
          row.commonComponents.endUserNotificationAndSubscription,
        ),
        Publishing: commonComponentToText(row.commonComponents.publishing),
        'Business Intelligence Dashboard and Metrics reporting': commonComponentToText(
          row.commonComponents.businessIntelligence,
        ),
        Other: row.commonComponents.other,
      };
    }),
    'common-components.csv',
  );
});
