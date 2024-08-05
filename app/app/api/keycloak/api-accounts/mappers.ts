export function getRolesMapperPayload(roles: string[]) {
  const rolesMapperData = {
    name: 'roles',
    protocol: 'openid-connect',
    protocolMapper: 'oidc-hardcoded-claim-mapper',
    config: {
      'claim.name': 'roles',
      'claim.value': roles.join(','),
      'jsonType.label': 'String',
      'id.token.claim': 'true',
      'access.token.claim': 'true',
      'userinfo.token.claim': 'true',
      'access.tokenResponse.claim': 'false',
    },
  };

  return rolesMapperData;
}

export function getServiceAccountTypeMapperPayload(type: string) {
  const rolesMapperData = {
    name: 'service-account-type',
    protocol: 'openid-connect',
    protocolMapper: 'oidc-hardcoded-claim-mapper',
    config: {
      'claim.name': 'service_account_type',
      'claim.value': type,
      'jsonType.label': 'String',
      'id.token.claim': 'true',
      'access.token.claim': 'true',
      'userinfo.token.claim': 'true',
      'access.tokenResponse.claim': 'false',
    },
  };

  return rolesMapperData;
}
