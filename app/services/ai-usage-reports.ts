import { FABRIC_AI_USAGE_CODE_QUALITY_REPORT_ID, FABRIC_AI_USAGE_TEAM_REPORT_ID, FABRIC_WORKSPACE_ID } from '@/config';
import { AiUsageEmbedInfo, AiUsageReportKey, FabricReportFilter } from '@/types/fabric';
import { generateReportEmbedToken } from './fabric';

const GITHUB_USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPOSITORY_NAME_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

type TeamUser = { githubAccount?: { username: string } | null } | null | undefined;

export interface AiUsageProduct {
  projectOwner: TeamUser;
  primaryTechnicalLead: TeamUser;
  secondaryTechnicalLead?: TeamUser;
  members: TeamUser[];
  repositories?: { url: string }[] | null;
}

interface AiUsageReportDefinition {
  reportId: string;
  filterTarget: { table: string; column: string };
  getFilterValues: (product: AiUsageProduct) => string[];
}

function unique(values: (string | undefined)[], pattern: RegExp) {
  return Array.from(new Set(values.filter((value): value is string => !!value && pattern.test(value))));
}

export function getTeamGitHubUsernames({
  projectOwner,
  primaryTechnicalLead,
  secondaryTechnicalLead,
  members,
}: AiUsageProduct) {
  const users = [projectOwner, primaryTechnicalLead, secondaryTechnicalLead, ...members];
  return unique(
    users.map((user) => user?.githubAccount?.username?.trim()),
    GITHUB_USERNAME_PATTERN,
  );
}

// Repository URLs are free text; the report is keyed by the bare repository name (last path segment).
export function getRepositoryNames({ repositories }: AiUsageProduct) {
  return unique(
    (repositories ?? []).map(({ url }) => {
      const trimmedUrl = url.trim();
      const normalizedUrl = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
      if (!URL.canParse(normalizedUrl)) return undefined;

      return new URL(normalizedUrl).pathname
        .replace(/\/+$/, '')
        .split('/')
        .pop()
        ?.replace(/\.git$/, '');
    }),
    REPOSITORY_NAME_PATTERN,
  );
}

const aiUsageReports: Record<AiUsageReportKey, AiUsageReportDefinition> = {
  team: {
    reportId: FABRIC_AI_USAGE_TEAM_REPORT_ID,
    filterTarget: { table: 'ai_credit_usage', column: 'username' },
    getFilterValues: getTeamGitHubUsernames,
  },
  quality: {
    reportId: FABRIC_AI_USAGE_CODE_QUALITY_REPORT_ID,
    filterTarget: { table: 'ai_credit_usage', column: 'repository' },
    getFilterValues: getRepositoryNames,
  },
};

export function isAiUsageReportConfigured(key: AiUsageReportKey) {
  return Boolean(aiUsageReports[key].reportId);
}

export function getAiUsageReportFilter(key: AiUsageReportKey, product: AiUsageProduct): FabricReportFilter | null {
  const { filterTarget, getFilterValues } = aiUsageReports[key];
  const values = getFilterValues(product);

  return values.length > 0 ? { ...filterTarget, values } : null;
}

export async function getAiUsageEmbedInfo(key: AiUsageReportKey, product: AiUsageProduct): Promise<AiUsageEmbedInfo> {
  const filter = getAiUsageReportFilter(key, product);
  if (!filter) return { available: false };

  const embed = await generateReportEmbedToken(FABRIC_WORKSPACE_ID, aiUsageReports[key].reportId);

  return { available: true, ...embed, filter };
}
