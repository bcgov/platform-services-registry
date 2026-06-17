import { describe, it, expect } from '@jest/globals';
import { privateCloudQuotaJustificationMaxLength } from '@/constants/private-cloud';
import {
  publicCloudNetworkingReasonMaxLength,
  publicCloudProviderSelectionReasonsNoteMaxLength,
} from '@/constants/public-cloud';
import { Cluster, Provider } from '@/prisma/client';
import { _privateCloudCreateRequestBodySchema } from './private-cloud';
import { publicCloudCreateRequestBodySchema } from './public-cloud';

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

describe('Private Cloud quotaJustification max length', () => {
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
