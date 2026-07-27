import { Tooltip } from '@mantine/core';
import { IconHelpCircle } from '@tabler/icons-react';
import ExternalLink from '@/components/generic/button/ExternalLink';
import { awsLzaGroupsUrl, publicCloudTechnicalDocsUrl } from '@/constants/public-cloud';
import { ProjectStatus, Provider } from '@/prisma/client';

export default function AwsLzaAccessLinks({
  product,
}: {
  product: {
    provider: Provider;
    status: ProjectStatus;
  };
}) {
  if (product.provider !== Provider.AWS_LZA || product.status !== ProjectStatus.ACTIVE) {
    return null;
  }

  return (
    <div className="mt-5 border-t border-gray-200 pt-5">
      <p className="mb-1">Access to this AWS project set is managed through Entra ID security groups.</p>
      <div className="flex items-center gap-2">
        <ExternalLink href={awsLzaGroupsUrl} className="font-semibold">
          Manage access through here
        </ExternalLink>
        <Tooltip label="Learn more in the Public Cloud technical documentation">
          <a
            href={publicCloudTechnicalDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Learn more about managing AWS LZA access"
            className="inline-flex text-gray-500 hover:text-blue-700"
          >
            <IconHelpCircle size={18} />
          </a>
        </Tooltip>
      </div>
    </div>
  );
}
