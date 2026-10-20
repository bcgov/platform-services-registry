import { describe, it, expect } from '@jest/globals';
import { buildRollingFiscalForecastMonths } from '@/components/public-cloud/forecast/forecast-grid-utils';
import {
  privateCloudQuotaJustificationMaxLength,
  privateCloudProductDescriptionMaxLength,
} from '@/constants/private-cloud';
import {
  publicCloudNetworkingReasonMaxLength,
  publicCloudProviderSelectionReasonsNoteMaxLength,
} from '@/constants/public-cloud';
import { Cluster, Provider } from '@/prisma/client';
import { _privateCloudCreateRequestBodySchema } from './private-cloud';
import { publicCloudCreateForecastRequiredMessage, publicCloudCreateRequestBodySchema } from './public-cloud';

const resourceRequests = {
  development: { cpu: 1, memory: 1, storage: 1 },
  test: { cpu: 1, memory: 1, storage: 1 },
  production: { cpu: 1, memory: 1, storage: 1 },
  tools: { cpu: 1, memory: 1, storage: 1 },
};

function createPrivateCloudPayload() {
  return {
    name: 'Private Product',
    description: 'Description',
    cluster: Cluster.SILVER,
    organizationId: 'a'.repeat(24),
    isAgMinistry: false,
    projectOwnerId: 'b'.repeat(24),
    primaryTechnicalLeadId: 'c'.repeat(24),
    secondaryTechnicalLeadId: 'd'.repeat(24),
    golddrEnabled: false,
    isTest: false,
    resourceRequests,
    requestComment: '',
  };
}

function createPublicCloudPayload() {
  return {
    name: 'Public Product',
    description: 'Description',
    provider: Provider.AZURE,
    providerSelectionReasons: ['Other'],
    providerSelectionReasonsNote: 'initial',
    requiresNetworking: false,
    networkingReason: '',
    budget: { dev: 0, test: 0, prod: 0, tools: 0 },
    organizationId: 'a'.repeat(24),
    isAgMinistry: false,
    projectOwnerId: 'b'.repeat(24),
    primaryTechnicalLeadId: 'c'.repeat(24),
    secondaryTechnicalLeadId: 'd'.repeat(24),
    expenseAuthorityId: 'e'.repeat(24),
    requestComment: '',
    forecastMonthlyValues: buildRollingFiscalForecastMonths(1000, 'CAD'),
    environmentsEnabled: {
      development: true,
      developmentRequiresNetworking: false,
      test: false,
      testRequiresNetworking: false,
      production: false,
      productionRequiresNetworking: false,
      tools: false,
      toolsRequiresNetworking: false,
    },
  };
}

describe('Private Cloud text field max lengths', () => {
  it('accepts quotaJustification at max length', () => {
    const result = _privateCloudCreateRequestBodySchema.safeParse({
      ...createPrivateCloudPayload(),
      quotaJustification: 'x'.repeat(privateCloudQuotaJustificationMaxLength),
    });

    expect(result.success).toBe(true);
  });

  it('rejects quotaJustification above max length', () => {
    const result = _privateCloudCreateRequestBodySchema.safeParse({
      ...createPrivateCloudPayload(),
      quotaJustification: 'x'.repeat(privateCloudQuotaJustificationMaxLength + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'quotaJustification')).toBe(true);
    }
  });

  it('accepts description at max length', () => {
    const result = _privateCloudCreateRequestBodySchema.safeParse({
      ...createPrivateCloudPayload(),
      description: 'x'.repeat(privateCloudProductDescriptionMaxLength),
    });

    expect(result.success).toBe(true);
  });

  it('rejects description above max length', () => {
    const result = _privateCloudCreateRequestBodySchema.safeParse({
      ...createPrivateCloudPayload(),
      description: 'x'.repeat(privateCloudProductDescriptionMaxLength + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'description')).toBe(true);
    }
  });
});

describe('Public Cloud text field max lengths', () => {
  it('accepts providerSelectionReasonsNote at max length', () => {
    const result = publicCloudCreateRequestBodySchema.safeParse({
      ...createPublicCloudPayload(),
      providerSelectionReasonsNote: 'x'.repeat(publicCloudProviderSelectionReasonsNoteMaxLength),
    });

    expect(result.success).toBe(true);
  });

  it('rejects providerSelectionReasonsNote above max length', () => {
    const result = publicCloudCreateRequestBodySchema.safeParse({
      ...createPublicCloudPayload(),
      providerSelectionReasonsNote: 'x'.repeat(publicCloudProviderSelectionReasonsNoteMaxLength + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'providerSelectionReasonsNote')).toBe(true);
    }
  });

  it('accepts networkingReason at max length', () => {
    const result = publicCloudCreateRequestBodySchema.safeParse({
      ...createPublicCloudPayload(),
      networkingReason: 'x'.repeat(publicCloudNetworkingReasonMaxLength),
    });

    expect(result.success).toBe(true);
  });

  it('rejects networkingReason above max length', () => {
    const result = publicCloudCreateRequestBodySchema.safeParse({
      ...createPublicCloudPayload(),
      networkingReason: 'x'.repeat(publicCloudNetworkingReasonMaxLength + 1),
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'networkingReason')).toBe(true);
    }
  });
});

describe('Public Cloud create forecast', () => {
  it('rejects a create request with no forecast', () => {
    const result = publicCloudCreateRequestBodySchema.safeParse({
      ...createPublicCloudPayload(),
      forecastMonthlyValues: undefined,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === publicCloudCreateForecastRequiredMessage)).toBe(
        true,
      );
    }
  });

  it('rejects a create request when a required month is blank', () => {
    const forecastMonthlyValues = buildRollingFiscalForecastMonths(1000, 'CAD');
    const requiredMonth = forecastMonthlyValues.find((month) => month.amount > 0);
    if (!requiredMonth) {
      throw new Error('expected a required forecast month');
    }
    requiredMonth.amount = 0;

    const result = publicCloudCreateRequestBodySchema.safeParse({
      ...createPublicCloudPayload(),
      forecastMonthlyValues,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path[0] === 'forecastMonthlyValues')).toBe(true);
    }
  });

  it('accepts a create request when every required month has an amount', () => {
    const result = publicCloudCreateRequestBodySchema.safeParse(createPublicCloudPayload());

    expect(result.success).toBe(true);
  });
});
