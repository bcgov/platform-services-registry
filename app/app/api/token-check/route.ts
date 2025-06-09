import { NextResponse } from 'next/server';
import createApiHandler from '@/core/api-handler';
import { validateChesServiceAccountCredentials } from './validations/ches-service-account-credentials';
import { validateKeycloakServiceAccount } from './validations/keycloak-service-account-credentials';
import { validateKeycloakUserLogin } from './validations/keycloak-user-login-credentials';
import { validateKubernetisDeletionCheckTokens } from './validations/kubernetis-deletion-check-tokens';
import { validateKubernetisMetricsReaderTokens } from './validations/kubernetis-metrics-reader-tokens';
import { validateMsGraphServiceAccountCredentials } from './validations/ms-graph-service-account-credentials';

export const POST = createApiHandler({})(async () => {
  const [
    keycloakServiceAccountCredentials,
    keycloakUserLoginCredentials,
    kubernetisMetricsReaderTokens,
    kubernetisDeletionCheckTokens,
    chesServiceAccountCredentials,
    msGraphServiceAccountCredentials,
  ] = await Promise.all([
    validateKeycloakServiceAccount(),
    validateKeycloakUserLogin(),
    validateKubernetisMetricsReaderTokens(),
    validateKubernetisDeletionCheckTokens(),
    validateChesServiceAccountCredentials(),
    validateMsGraphServiceAccountCredentials(),
  ]);

  return NextResponse.json({
    keycloakServiceAccountCredentials,
    keycloakUserLoginCredentials,
    kubernetisMetricsReaderTokens,
    kubernetisDeletionCheckTokens,
    chesServiceAccountCredentials,
    msGraphServiceAccountCredentials,
  });
});
