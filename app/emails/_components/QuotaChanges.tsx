import { Heading, Link, Text } from '@react-email/components';
import { cpuMetadata, memoryMetadata, storageMetadata } from '@/constants';
import { Quota } from '@/validation-schemas/private-cloud';

interface QuotaChangesProps {
  licencePlate: string;
  quotaCurrent: Quota;
  quotaRequested: Quota;
  type: string;
  cluster: string;
  currentLabel?: string;
  requestedLabel?: string;
}

export default function QuotaChanges({
  licencePlate,
  quotaCurrent,
  quotaRequested,
  type,
  cluster,
  currentLabel = 'Current',
  requestedLabel = 'Requested',
}: QuotaChangesProps) {
  cluster = cluster.toLowerCase();
  return (
    <div className="mb-4 mr-16">
      <Heading className="mt-4 mb-0 text-base">{type} Namespace</Heading>
      <Link
        className="mt-0 mb-0 h-4"
        href={`https://console.apps.${cluster}.devops.gov.bc.ca/topology/ns/${licencePlate}?view=graph`}
      >
        {licencePlate}
      </Link>
      {quotaCurrent.cpu !== quotaRequested.cpu && (
        <div>
          <Text className="mt-4 mb-0 font-semibold h-4">CPU</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{currentLabel} Quota</Text>
          <Text className="mt-1 mb-0 h-4">{cpuMetadata[quotaCurrent.cpu].label}</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{requestedLabel} Quota</Text>
          <Text className="mt-1 mb-0 h-4">{cpuMetadata[quotaRequested.cpu].label}</Text>
        </div>
      )}
      {quotaCurrent.memory !== quotaRequested.memory && (
        <div>
          <Text className="mt-6 mb-0 font-semibold h-4">Memory</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{currentLabel} Memory</Text>
          <Text className="mt-1 mb-0 h-4">{memoryMetadata[quotaCurrent.memory].label}</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{requestedLabel} Memory</Text>
          <Text className="mt-1 mb-0 h-4">{memoryMetadata[quotaRequested.memory].label}</Text>
        </div>
      )}
      {quotaCurrent.storage !== quotaRequested.storage && (
        <div>
          <Text className="mt-6 mb-0 font-semibold h-4">Storage</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{currentLabel} Storage</Text>
          <Text className="mt-1 mb-0 h-4">{storageMetadata[quotaCurrent.storage].label}</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{requestedLabel} Storage</Text>
          <Text className="mt-1 mb-0 h-4">{storageMetadata[quotaRequested.storage].label}</Text>
        </div>
      )}
    </div>
  );
}
