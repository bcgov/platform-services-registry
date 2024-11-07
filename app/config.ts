export const SECURE_HEADERS = process.env.SECURE_HEADERS || '';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
export const NODE_ENV = process.env.NODE_ENV || '';
export const APP_ENV = process.env.APP_ENV || 'localdev';
export const IS_LOCAL = APP_ENV === 'localdev';
export const IS_DEV = APP_ENV === 'dev';
export const IS_TEST = APP_ENV === 'test';
export const IS_PROD = APP_ENV === 'prod';
export const EMAIL_PREFIX = IS_PROD ? '' : `[${process.env.APP_ENV}] `;
export const DEPLOYMENT_TAG = process.env.DEPLOYMENT_TAG || '';
export const ENABLE_DELETION_CHECK = !['localdev', 'dev'].includes(APP_ENV);
export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Keycloak environments
export const AUTH_BASE_URL = process.env.AUTH_BASE_URL || 'http://localhost:8080';
export const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || 'http://localhost:8080';
export const AUTH_RELM = process.env.AUTH_RELM || 'platform-services';
export const AUTH_RESOURCE = process.env.AUTH_RESOURCE || 'pltsvc';
export const AUTH_SECRET = process.env.AUTH_SECRET || 'testsecret';
export const KEYCLOAK_ADMIN_CLIENT_ID = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'pltsvc-admin-cli';
export const KEYCLOAK_ADMIN_CLIENT_SECRET = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || 'testsecret';
export const AWS_ROLES_BASE_URL = process.env.AWS_ROLES_BASE_URL || 'http://localhost:8080';
export const AWS_ROLES_REALM_NAME = process.env.AWS_ROLES_REALM_NAME || 'public-cloud';
export const AWS_ROLES_CLIENT_ID = process.env.AWS_ROLES_CLIENT_ID || 'roles';
export const AWS_ROLES_CLIENT_SECRET = process.env.AWS_ROLES_CLIENT_SECRET || 'testsecret';
export const AWS_ROLES_IDENTITY_PROVIDER = process.env.AWS_ROLES_IDENTITY_PROVIDER || 'azureidir';

export const CHES_TOKEN_URL = process.env.CHES_TOKEN_URL || '';
export const CHES_API_URL = process.env.CHES_API_URL || 'http://localhost:8025/api/v1/';
export const CHES_CLIENT_ID = process.env.CHES_CLIENT_ID || '';
export const CHES_CLIENT_SECRET = process.env.CHES_CLIENT_SECRET || '';
export const CLAB_SERVICE_ACCOUNT_TOKEN = process.env.CLAB_SERVICE_ACCOUNT_TOKEN || '';
export const KLAB_SERVICE_ACCOUNT_TOKEN = process.env.KLAB_SERVICE_ACCOUNT_TOKEN || '';
export const KLAB2_SERVICE_ACCOUNT_TOKEN = process.env.KLAB2_SERVICE_ACCOUNT_TOKEN || '';
export const GOLDDR_SERVICE_ACCOUNT_TOKEN = process.env.GOLDDR_SERVICE_ACCOUNT_TOKEN || '';
export const GOLD_SERVICE_ACCOUNT_TOKEN = process.env.GOLD_SERVICE_ACCOUNT_TOKEN || '';
export const SILVER_SERVICE_ACCOUNT_TOKEN = process.env.SILVER_SERVICE_ACCOUNT_TOKEN || '';
export const EMERALD_SERVICE_ACCOUNT_TOKEN = process.env.EMERALD_SERVICE_ACCOUNT_TOKEN || '';
export const CLAB_METRICS_READER_TOKEN = process.env.CLAB_METRICS_READER_TOKEN || '';
export const KLAB_METRICS_READER_TOKEN = process.env.KLAB_METRICS_READER_TOKEN || '';
export const KLAB2_METRICS_READER_TOKEN = process.env.KLAB2_METRICS_READER_TOKEN || '';
export const GOLDDR_METRICS_READER_TOKEN = process.env.GOLDDR_METRICS_READER_TOKEN || '';
export const GOLD_METRICS_READER_TOKEN = process.env.GOLD_METRICS_READER_TOKEN || '';
export const SILVER_METRICS_READER_TOKEN = process.env.SILVER_METRICS_READER_TOKEN || '';
export const EMERALD_METRICS_READER_TOKEN = process.env.EMERALD_METRICS_READER_TOKEN || '';
export const PRIVATE_NATS_HOST = process.env.PRIVATE_NATS_HOST || 'localhost';
export const PRIVATE_NATS_PORT = process.env.PRIVATE_NATS_PORT || '4222';
export const PUBLIC_NATS_HOST = process.env.PUBLIC_NATS_HOST || 'localhost';
export const PUBLIC_NATS_PORT = process.env.PUBLIC_NATS_PORT || '4222';

export const PRIVATE_NATS_URL = `${PRIVATE_NATS_HOST}:${PRIVATE_NATS_PORT}`;
export const PUBLIC_NATS_URL = `${PUBLIC_NATS_HOST}:${PUBLIC_NATS_PORT}`;

export const MS_GRAPH_API_AUTHORITY = process.env.MS_GRAPH_API_AUTHORITY || '';
export const MS_GRAPH_API_CLIENT_ID = process.env.MS_GRAPH_API_CLIENT_ID || '';
export const MS_GRAPH_API_CLIENT_SECRET = process.env.MS_GRAPH_API_CLIENT_SECRET || '';
export const M365_PROXY_URL = process.env.M365_PROXY_URL || 'http://localhost:8000';
export const M365_URL = process.env.M365_URL || 'https://graph.microsoft.com';
export const USE_M365_PROXY = process.env.USE_M365_PROXY === 'true';
export const OIDC_AUTHORITY = process.env.OIDC_AUTHORITY || 'https://localhost:8443/realms/platform-services';

export const PUBLIC_AZURE_ACCESS_EMAILS = process.env.PUBLIC_AZURE_ACCESS_EMAILS || '';
export const WEASYPRINT_URL = process.env.WEASYPRINT_URL || 'http://localhost:8090';
