import { expect } from '@jest/globals';
import { AiUsageProduct, getAiUsageReportFilter, getRepositoryNames, getTeamGitHubUsernames } from './ai-usage-reports';

const user = (username?: string) => ({ githubAccount: username ? { username } : null });

const product = (overrides: Partial<AiUsageProduct> = {}): AiUsageProduct => ({
  projectOwner: user(),
  primaryTechnicalLead: user(),
  members: [],
  repositories: [],
  ...overrides,
});

describe('getTeamGitHubUsernames', () => {
  it('collects unique usernames from the owner, tech leads and members', () => {
    expect(
      getTeamGitHubUsernames(
        product({
          projectOwner: user('owner'),
          primaryTechnicalLead: user('lead'),
          secondaryTechnicalLead: user('owner'),
          members: [user('member'), user(' lead ')],
        }),
      ),
    ).toEqual(['owner', 'lead', 'member']);
  });

  it('skips users without a valid GitHub username and a missing secondary tech lead', () => {
    expect(
      getTeamGitHubUsernames(
        product({
          primaryTechnicalLead: user('lead'),
          secondaryTechnicalLead: null,
          members: [user(), user('  '), user("bad'name")],
        }),
      ),
    ).toEqual(['lead']);
  });
});

describe('getRepositoryNames', () => {
  it('extracts unique repository names from URLs in different formats', () => {
    expect(
      getRepositoryNames(
        product({
          repositories: [
            { url: 'https://github.com/bcgov/platform-services-registry' },
            { url: 'github.com/bcgov/other-repo.git' },
            { url: 'https://github.com/bcgov/platform-services-registry/' },
          ],
        }),
      ),
    ).toEqual(['platform-services-registry', 'other-repo']);
  });

  it('skips URLs without a valid repository name', () => {
    expect(getRepositoryNames(product({ repositories: [{ url: 'https://github.com' }, { url: '' }] }))).toEqual([]);
  });
});

describe('getAiUsageReportFilter', () => {
  it('builds the filter for the selected report', () => {
    const p = product({ projectOwner: user('owner'), repositories: [{ url: 'https://github.com/bcgov/repo' }] });

    expect(getAiUsageReportFilter('team', p)).toEqual({
      table: 'ai_credit_usage',
      column: 'username',
      values: ['owner'],
    });
    expect(getAiUsageReportFilter('quality', p)).toEqual({
      table: 'ai_credit_usage',
      column: 'repository',
      values: ['repo'],
    });
  });

  it('returns null when the product has nothing to filter on', () => {
    expect(getAiUsageReportFilter('quality', product())).toBeNull();
  });
});
