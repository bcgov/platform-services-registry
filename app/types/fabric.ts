export const aiUsageReportKeys = ['team', 'quality'] as const;

export type AiUsageReportKey = (typeof aiUsageReportKeys)[number];

export interface FabricReportFilter {
  table: string;
  column: string;
  values: string[];
}

export interface FabricEmbedToken {
  reportId: string;
  embedUrl: string;
  embedToken: string;
  expiration: string;
}

type AiUsageEmbedUnavailable = { available: false };

type AiUsageEmbedAvailable = { available: true; filters: FabricReportFilter[] } & FabricEmbedToken;

export type AiUsageEmbedInfo = AiUsageEmbedUnavailable | AiUsageEmbedAvailable;
