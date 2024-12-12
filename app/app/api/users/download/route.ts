import { GlobalPermissions } from '@/constants';
import createApiHandler from '@/core/api-handler';
import { NoContent, CsvResponse } from '@/core/responses';
import { formatFullName } from '@/helpers/user';
import { searchUsersWithRoles } from '@/services/db';
import { formatDate } from '@/utils/js';
import { userSearchBodySchema } from '@/validation-schemas';

export const POST = createApiHandler({
  permissions: [GlobalPermissions.ViewUsers],
  validations: { body: userSearchBodySchema },
})(async ({ session, body }) => {
  const searchProps = {
    ...body,
    page: 1,
    pageSize: 10000,
  };

  const { data, totalCount } = await searchUsersWithRoles(searchProps);

  if (data.length === 0) {
    return NoContent();
  }

  const formattedData = data.map((user) => ({
    Name: formatFullName(user),
    Email: user.email,
    IDIR: user.idir,
    UPN: user.upn,
    Office: user.officeLocation,
    Title: user.jobTitle,
    '# of private cloud products': user.privateProducts.length,
    '# of public cloud products': user.publicProducts.length,
    Roles: user.roles.join(', '),
    'Last active': formatDate(user.lastSeen),
  }));

  return CsvResponse(formattedData, 'users.csv');
});
