import { Heading, Link, Text } from '@react-email/components';
import { QuotaInput } from '@/schema';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from '@/constants';

interface QuotaChangesProps {
  licencePlate: string;
  quotaCurrent: QuotaInput;
  quotaRequested: QuotaInput;
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
          <Text className="mt-1 mb-0 h-4">{defaultCpuOptionsLookup[quotaCurrent.cpu]}</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{requestedLabel} Quota</Text>
          <Text className="mt-1 mb-0 h-4">{defaultCpuOptionsLookup[quotaRequested.cpu]}</Text>
        </div>
      )}
      {quotaCurrent.memory !== quotaRequested.memory && (
        <div>
          <Text className="mt-6 mb-0 font-semibold h-4">Memory</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{currentLabel} Memory</Text>
          <Text className="mt-1 mb-0 h-4">{defaultMemoryOptionsLookup[quotaCurrent.memory]}</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{requestedLabel} Memory</Text>
          <Text className="mt-1 mb-0 h-4">{defaultMemoryOptionsLookup[quotaRequested.memory]}</Text>
        </div>
      )}
      {quotaCurrent.storage !== quotaRequested.storage && (
        <div>
          <Text className="mt-6 mb-0 font-semibold h-4">Storage</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{currentLabel} Storage</Text>
          <Text className="mt-1 mb-0 h-4">{defaultStorageOptionsLookup[quotaCurrent.storage]}</Text>
          <Text className="mt-2 mb-0 font-medium h-3">{requestedLabel} Storage</Text>
          <Text className="mt-1 mb-0 h-4">{defaultStorageOptionsLookup[quotaRequested.storage]}</Text>
        </div>
      )}
    </div>
  );
}
