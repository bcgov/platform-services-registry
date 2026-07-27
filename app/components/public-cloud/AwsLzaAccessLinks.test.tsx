import { render, screen } from '@testing-library/react';
import { awsLzaGroupsUrl, publicCloudTechnicalDocsUrl } from '@/constants/public-cloud';
import { ProjectStatus, Provider } from '@/prisma/client';
import AwsLzaAccessLinks from './AwsLzaAccessLinks';

describe('AwsLzaAccessLinks', () => {
  it('shows access links for active AWS LZA products', () => {
    render(<AwsLzaAccessLinks product={{ provider: Provider.AWS_LZA, status: ProjectStatus.ACTIVE }} />);

    expect(screen.getByRole('link', { name: /manage access through here/i })).toHaveAttribute('href', awsLzaGroupsUrl);
    expect(screen.getByRole('link', { name: /learn more about managing aws lza access/i })).toHaveAttribute(
      'href',
      publicCloudTechnicalDocsUrl,
    );
  });

  it.each([
    { provider: Provider.AWS, status: ProjectStatus.ACTIVE },
    { provider: Provider.AZURE, status: ProjectStatus.ACTIVE },
    { provider: Provider.AWS_LZA, status: ProjectStatus.INACTIVE },
  ])('does not show access links for $provider products with $status status', (product) => {
    const { container } = render(<AwsLzaAccessLinks product={product} />);

    expect(container).toBeEmptyDOMElement();
  });
});
