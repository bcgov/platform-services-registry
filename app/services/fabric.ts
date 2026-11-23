import axios, { isAxiosError } from 'axios';
import jwt from 'jsonwebtoken';
import {
  FABRIC_CLIENT_ID,
  FABRIC_CLIENT_SECRET,
  FABRIC_TENANT_ID,
  FABRIC_WORKSPACE_ID,
  POWER_BI_API_URL,
} from '@/config';
import { FabricEmbedToken } from '@/types/fabric';
import { getClientCredentialsToken } from '@/utils/node/oauth2';

const POWER_BI_SCOPE = 'https://analysis.windows.net/powerbi/api/.default';

// Embed tokens can't outlive the Entra token used to generate them, so renew it well before it expires.
const TOKEN_RENEWAL_MARGIN_MS = 15 * 60 * 1000;

// Report metadata rarely changes, but re-check periodically in case a report is rebound to another dataset.
const REPORT_CACHE_TTL_MS = 60 * 60 * 1000;

interface PowerBiReport {
  id: string;
  datasetId: string;
  embedUrl: string;
}

interface PowerBiEmbedToken {
  token: string;
  expiration: string;
}

export function isFabricConfigured() {
  return Boolean(FABRIC_TENANT_ID && FABRIC_CLIENT_ID && FABRIC_CLIENT_SECRET && FABRIC_WORKSPACE_ID);
}

// Axios errors carry request config (bearer token, client secret), so only surface the status and response body.
function toFabricError(error: unknown, action: string) {
  if (isAxiosError(error)) {
    const detail = error.response ? `${error.response.status} ${JSON.stringify(error.response.data)}` : error.code;
    return new Error(`Fabric ${action} failed: ${detail}`);
  }

  return new Error(`Fabric ${action} failed: ${error instanceof Error ? error.message : String(error)}`);
}

let cachedToken: { token: string; expiresAt: number } | null = null;
let pendingTokenRequest: Promise<string> | null = null;

async function requestAccessToken() {
  let token: string | undefined;
  try {
    token = await getClientCredentialsToken(
      `https://login.microsoftonline.com/${FABRIC_TENANT_ID}/oauth2/v2.0/token`,
      FABRIC_CLIENT_ID,
      FABRIC_CLIENT_SECRET,
      POWER_BI_SCOPE,
    );
  } catch (error) {
    throw toFabricError(error, 'access token request');
  }

  if (!token) {
    throw new Error('Fabric access token request failed: no token returned');
  }

  const decoded = jwt.decode(token) as { exp?: number } | null;
  cachedToken = { token, expiresAt: decoded?.exp ? decoded.exp * 1000 : Date.now() + TOKEN_RENEWAL_MARGIN_MS * 2 };

  return token;
}

// Concurrent callers share one in-flight request instead of each fetching a new token.
function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt - Date.now() > TOKEN_RENEWAL_MARGIN_MS) {
    return Promise.resolve(cachedToken.token);
  }

  pendingTokenRequest ??= requestAccessToken().finally(() => {
    pendingTokenRequest = null;
  });

  return pendingTokenRequest;
}

const instance = axios.create({
  baseURL: POWER_BI_API_URL,
  timeout: 30000,
});

instance.interceptors.request.use(async (config) => {
  config.headers.Authorization = `Bearer ${await getAccessToken()}`;
  return config;
});

const reportCache = new Map<string, { report: Promise<PowerBiReport>; expiresAt: number }>();

function getReport(workspaceId: string, reportId: string) {
  const key = `${workspaceId}/${reportId}`;
  const cached = reportCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.report;
  }

  const report = instance
    .get<PowerBiReport>(`/groups/${workspaceId}/reports/${reportId}`)
    .then((res) => res.data)
    .catch((error) => {
      // Don't cache failures, so the next request retries the lookup.
      if (reportCache.get(key)?.report === report) reportCache.delete(key);
      throw toFabricError(error, 'report lookup');
    });

  reportCache.set(key, { report, expiresAt: Date.now() + REPORT_CACHE_TTL_MS });
  return report;
}

// See https://learn.microsoft.com/en-us/rest/api/power-bi/embed-token/generate-token
export async function generateReportEmbedToken(workspaceId: string, reportId: string): Promise<FabricEmbedToken> {
  const report = await getReport(workspaceId, reportId);

  const embedToken = await instance
    .post<PowerBiEmbedToken>('/GenerateToken', {
      reports: [{ id: report.id }],
      datasets: [{ id: report.datasetId }],
    })
    .then((res) => res.data)
    .catch((error) => {
      throw toFabricError(error, 'embed token generation');
    });

  return {
    reportId: report.id,
    embedUrl: report.embedUrl,
    embedToken: embedToken.token,
    expiration: embedToken.expiration,
  };
}
