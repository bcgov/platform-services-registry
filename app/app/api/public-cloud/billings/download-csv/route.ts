import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { searchPublicCloudBillings } from '@/services/db/public-cloud-billing';
import { formatDate } from '@/utils/js';
import { publicCloudBillingSearchBodySchema } from '@/validation-schemas';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewPublicCloudBilling],
  validations: { body: publicCloudBillingSearchBodySchema },
})(async ({ session, body }) => {
  const searchProps = {
    ...body,
    page: 1,
    pageSize: 10000,
    session,
  };

  const { data, totalCount } = await searchPublicCloudBillings(searchProps);

  if (data.length === 0) {
    return NoContent();
  }

  const formattedData = data.map((billing) => ({
    'Licence plate': billing.licencePlate,
    'Account coding': billing.accountCoding,
    'Create Date': formatDate(billing.createdAt),
    'Expense authority': billing.expenseAuthority?.email,
    'Approved by': billing.approvedBy?.email ?? '',
    'Signed by': billing.signedBy?.email ?? '',
    Approved: billing.approved,
    Signed: billing.signed,
  }));

  return CsvResponse(formattedData, 'billings.csv');
});
