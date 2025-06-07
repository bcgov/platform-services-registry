import { NextResponse } from 'next/server';
import createApiHandler from '@/core/api-handler';
import { validateChesCredentials } from './validations/ches-client-credentials';
import { validateKeycloakServiceAccount } from './validations/keycloak-service-account-credentials';
import { validateKeycloakUserLogin } from './validations/keycloak-user-login-credentials';
import { validateAllMetricsReaderTokens } from './validations/metrics-reader-tokens';
import { validateMsGraphCredentials } from './validations/ms-graph-client-credentials';
import { validateAllServiceAccountTokens } from './validations/service-account-tokens';

export const POST = createApiHandler({})(async () => {
  const [
    keycloakServiceAccountCredentials,
    keycloakUserLoginCredentials,
    metricsTokens,
    serviceAccountTokens,
    chesCredentials,
    msGraphCredentials,
  ] = await Promise.all([
    validateKeycloakServiceAccount(),
    validateKeycloakUserLogin(),
    validateAllMetricsReaderTokens(),
    validateAllServiceAccountTokens(),
    validateChesCredentials(),
    validateMsGraphCredentials(),
  ]);

  return NextResponse.json({
    keycloakServiceAccountCredentials,
    keycloakUserLoginCredentials,
    metricsTokens,
    serviceAccountTokens,
    chesCredentials,
    msGraphCredentials,
  });
});
