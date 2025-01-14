import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { searchBilling } from '@/services/db/billing';
import { formatDate } from '@/utils/js';
import { billingSearchBodySchema } from '@/validation-schemas/billing';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewBilling],
  validations: { body: billingSearchBodySchema },
})(async ({ session, body }) => {
  const searchProps = {
    ...body,
    page: 1,
    pageSize: 10000,
  };

  const { data, totalCount } = await searchBilling(searchProps);

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

  return CsvResponse(formattedData, 'events.csv');
});
