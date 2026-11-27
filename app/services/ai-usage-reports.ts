import { FABRIC_AI_USAGE_CODE_QUALITY_REPORT_ID, FABRIC_AI_USAGE_TEAM_REPORT_ID, FABRIC_WORKSPACE_ID } from '@/config';
import { AiUsageEmbedInfo, AiUsageReportKey, FabricReportFilter } from '@/types/fabric';
import { generateReportEmbedToken } from './fabric';

// GitHub usernames and organization names share the same rules.
const GITHUB_NAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const REPOSITORY_NAME_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;

// The AI usage data only covers GitHub; other hosts could share an org/repo name with an unrelated GitHub repository.
const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

type TeamUser = { githubAccount?: { username: string } | null } | null;

export interface AiUsageProduct {
  projectOwner: TeamUser;
  primaryTechnicalLead: TeamUser;
  secondaryTechnicalLead?: TeamUser;
  members: TeamUser[];
  repositories?: { url: string }[] | null;
  // Private cloud only: repositories synced from GitOps, stored separately from the user-entered list.
  gitOpsRepositories?: { url: string }[] | null;
}

interface AiUsageReportDefinition {
  reportId: string;
  getFilters: (product: AiUsageProduct) => FabricReportFilter[] | null;
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
    GITHUB_NAME_PATTERN,
  );
}

// Repository URLs are free text, e.g. `https://github.com/<organization>/<repository>/tree/main`.
function parseRepository(url: string) {
  const trimmedUrl = url.trim();
  // Keep any scheme the URL already has (https, ssh, git, ...); only scheme-less input like `github.com/org/repo` gets one.
  const normalizedUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
  if (!URL.canParse(normalizedUrl)) return null;

  const { hostname, pathname } = new URL(normalizedUrl);
  if (!GITHUB_HOSTS.has(hostname.toLowerCase())) return null;

  const [organization, repository] = pathname.split('/').filter(Boolean);
  const name = repository?.replace(/\.git$/, '');
  if (!organization || !name || !GITHUB_NAME_PATTERN.test(organization) || !REPOSITORY_NAME_PATTERN.test(name)) {
    return null;
  }

  return { organization, repository: name };
}

export function getRepositories({ repositories, gitOpsRepositories }: AiUsageProduct) {
  const parsed = [...(repositories ?? []), ...(gitOpsRepositories ?? [])]
    .map(({ url }) => parseRepository(url))
    .filter((repo) => repo !== null);

  return {
    organizations: Array.from(new Set(parsed.map((repo) => repo.organization))),
    repositories: Array.from(new Set(parsed.map((repo) => repo.repository))),
  };
}

const AI_USAGE_TABLE = 'ai_credit_usage';

const aiUsageReports: Record<AiUsageReportKey, AiUsageReportDefinition> = {
  team: {
    reportId: FABRIC_AI_USAGE_TEAM_REPORT_ID,
    getFilters: (product) => {
      const usernames = getTeamGitHubUsernames(product);
      return usernames.length > 0 ? [{ table: AI_USAGE_TABLE, column: 'username', values: usernames }] : null;
    },
  },
  quality: {
    reportId: FABRIC_AI_USAGE_CODE_QUALITY_REPORT_ID,
    // Two independent filters: a product with repositories in several organizations can also match
    // same-named repositories across those organizations.
    getFilters: (product) => {
      const { organizations, repositories } = getRepositories(product);
      if (repositories.length === 0) return null;

      return [
        { table: AI_USAGE_TABLE, column: 'organization', values: organizations },
        { table: AI_USAGE_TABLE, column: 'repository', values: repositories },
      ];
    },
  },
};

export function isAiUsageReportConfigured(key: AiUsageReportKey) {
  return Boolean(aiUsageReports[key].reportId);
}

export function getAiUsageReportFilters(key: AiUsageReportKey, product: AiUsageProduct) {
  return aiUsageReports[key].getFilters(product);
}

export async function getAiUsageEmbedInfo(key: AiUsageReportKey, product: AiUsageProduct): Promise<AiUsageEmbedInfo> {
  const filters = getAiUsageReportFilters(key, product);
  if (!filters) return { available: false };

  const embed = await generateReportEmbedToken(FABRIC_WORKSPACE_ID, aiUsageReports[key].reportId);

  return { available: true, ...embed, filters };
}
