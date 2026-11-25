import { expect } from '@jest/globals';
import type { InternalAxiosRequestConfig } from 'axios';
import { getClientCredentialsToken } from '@/utils/node/oauth2';

const mockAdapter = jest.fn();

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');
  return {
    ...actual,
    __esModule: true,
    default: {
      ...actual.default,
      create: (config: object) => actual.default.create({ ...config, adapter: mockAdapter }),
    },
  };
});

jest.mock('@/config', () => ({
  ...jest.requireActual('@/config'),
  FABRIC_TENANT_ID: 'tenant-id',
  FABRIC_CLIENT_ID: 'client-id',
  FABRIC_CLIENT_SECRET: 'client-secret', // pragma: allowlist secret
  FABRIC_WORKSPACE_ID: 'workspace-id',
}));

jest.mock('@/utils/node/oauth2', () => ({
  getClientCredentialsToken: jest.fn(async () => 'access-token'),
}));

const mockGetClientCredentialsToken = jest.mocked(getClientCredentialsToken);

const report = { id: 'report-id', datasetId: 'dataset-id', embedUrl: 'https://app.powerbi.com/reportEmbed' };

function respond(config: InternalAxiosRequestConfig, data: unknown) {
  return Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config });
}

function powerBiResponses(config: InternalAxiosRequestConfig) {
  if (config.method === 'get') return respond(config, report);
  return respond(config, { token: 'embed-token', expiration: '2030-01-01T00:00:00Z' });
}

// The module keeps its token and report caches in module scope, so load a fresh copy per test.
function loadFabric() {
  let fabric!: typeof import('./fabric');
  jest.isolateModules(() => {
    fabric = require('./fabric');
  });
  return fabric;
}

const reportLookups = () => mockAdapter.mock.calls.filter(([config]) => config.method === 'get').length;

describe('generateReportEmbedToken', () => {
  beforeEach(() => {
    mockAdapter.mockReset();
    mockGetClientCredentialsToken.mockClear();
  });

  it('shares one access token request and report lookup across concurrent calls', async () => {
    mockAdapter.mockImplementation(powerBiResponses);
    const { generateReportEmbedToken } = loadFabric();

    const results = await Promise.all([
      generateReportEmbedToken('workspace-id', 'report-id'),
      generateReportEmbedToken('workspace-id', 'report-id'),
    ]);
    await generateReportEmbedToken('workspace-id', 'report-id');

    expect(results[0]).toEqual({
      reportId: 'report-id',
      embedUrl: report.embedUrl,
      embedToken: 'embed-token',
      expiration: '2030-01-01T00:00:00Z',
    });
    expect(mockGetClientCredentialsToken).toHaveBeenCalledTimes(1);
    expect(reportLookups()).toBe(1);
    expect(mockAdapter.mock.calls[0][0].headers.Authorization).toBe('Bearer access-token');
  });

  it('retries the report lookup after a failure instead of caching it', async () => {
    mockAdapter.mockImplementationOnce(() => Promise.reject(new Error('lookup failed')));
    mockAdapter.mockImplementation(powerBiResponses);
    const { generateReportEmbedToken } = loadFabric();

    await expect(generateReportEmbedToken('workspace-id', 'report-id')).rejects.toThrow(
      'Fabric report lookup failed: lookup failed',
    );
    await expect(generateReportEmbedToken('workspace-id', 'report-id')).resolves.toMatchObject({
      embedToken: 'embed-token',
    });

    expect(reportLookups()).toBe(2);
  });
});

describe('validateFabricReportAccess', () => {
  beforeEach(() => {
    mockAdapter.mockReset();
    mockGetClientCredentialsToken.mockClear();
  });

  it('requests a fresh access token and looks up every report, ignoring the caches', async () => {
    mockAdapter.mockImplementation(powerBiResponses);
    const { generateReportEmbedToken, validateFabricReportAccess } = loadFabric();

    await generateReportEmbedToken('workspace-id', 'report-a');
    await expect(validateFabricReportAccess(['report-a', 'report-b'])).resolves.toBe(true);

    expect(mockGetClientCredentialsToken).toHaveBeenCalledTimes(2);
    const lookups = mockAdapter.mock.calls.filter(([config]) => config.method === 'get').map(([config]) => config.url);
    expect(lookups).toEqual([
      '/groups/workspace-id/reports/report-a',
      '/groups/workspace-id/reports/report-a',
      '/groups/workspace-id/reports/report-b',
    ]);
  });

  it('fails when a report is not configured or cannot be looked up', async () => {
    mockAdapter.mockImplementation(() => Promise.reject(new Error('forbidden')));
    const { validateFabricReportAccess } = loadFabric();

    await expect(validateFabricReportAccess(['report-a', ''])).resolves.toBe(false);
    await expect(validateFabricReportAccess(['report-a'])).rejects.toThrow('forbidden');
  });
});
