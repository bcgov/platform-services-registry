import { parseMinistryFromDisplayName } from '@/components/utils/parseMinistryFromDisplayName';
const m365ProxyResponse = require('../localdev/m365proxy/responses.json');
const proxyUsers = m365ProxyResponse.responses.find(
  (res: { url: string }) => res.url === 'https://graph.microsoft.com/v1.0/users?$filter*',
).responseBody.value;

export function findMockUserByIDIR(idir: string) {
  let user = proxyUsers.find(
    ({ onPremisesSamAccountName }: { onPremisesSamAccountName: string }) => onPremisesSamAccountName === idir,
  );
  if (!user) user = proxyUsers[0];

  return {
    firstName: user.givenName,
    lastName: user.surname,
    email: user.mail,
    ministry: parseMinistryFromDisplayName(user.displayName),
    idir: user.onPremisesSamAccountName,
    upn: user.userPrincipalName,
  };
}
