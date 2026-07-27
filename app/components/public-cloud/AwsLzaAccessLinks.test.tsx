import { MantineProvider } from '@mantine/core';
import { renderToStaticMarkup } from 'react-dom/server';
import { awsLzaGroupsUrl, publicCloudTechnicalDocsUrl } from '@/constants/public-cloud';
import { ProjectStatus, Provider } from '@/prisma/client';
import AwsLzaAccessLinks from './AwsLzaAccessLinks';

describe('AwsLzaAccessLinks', () => {
  it('shows access links for active AWS LZA products', () => {
    const markup = renderToStaticMarkup(
      <MantineProvider>
        <AwsLzaAccessLinks product={{ provider: Provider.AWS_LZA, status: ProjectStatus.ACTIVE }} />
      </MantineProvider>,
    );

    expect(markup).toContain(`href="${awsLzaGroupsUrl}"`);
    expect(markup).toContain('Manage access through here');
    expect(markup).toContain(`href="${publicCloudTechnicalDocsUrl}"`);
    expect(markup).toContain('aria-label="Learn more about managing AWS LZA access"');
  });

  it.each([
    { provider: Provider.AWS, status: ProjectStatus.ACTIVE },
    { provider: Provider.AZURE, status: ProjectStatus.ACTIVE },
    { provider: Provider.AWS_LZA, status: ProjectStatus.INACTIVE },
  ])('does not show access links for $provider products with $status status', (product) => {
    const markup = renderToStaticMarkup(<AwsLzaAccessLinks product={product} />);

    expect(markup).toBe('');
  });
});
