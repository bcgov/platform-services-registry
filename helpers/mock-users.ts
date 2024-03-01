import { processMsUser } from '@/services/msgraph';
const m365ProxyResponse = require('../localdev/m365proxy/responses.json');
const proxyUsers = m365ProxyResponse.responses.find(
  (res: { url: string }) => res.url === 'https://graph.microsoft.com/v1.0/users?$filter*',
).responseBody.value;

export function findMockUserByIDIR(useridir: string) {
  let user = proxyUsers.find(
    ({ onPremisesSamAccountName }: { onPremisesSamAccountName: string }) => onPremisesSamAccountName === useridir,
  );
  if (!user) user = proxyUsers[0];

  const { firstName, lastName, email, ministry, idir, upn } = processMsUser(user);
  return { firstName, lastName, email, ministry, idir, upn };
}
