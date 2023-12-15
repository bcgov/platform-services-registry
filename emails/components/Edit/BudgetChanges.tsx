import { Heading, Link, Text } from '@react-email/components';
import { QuotaInput } from '@/schema';
import { defaultCpuOptionsLookup, defaultMemoryOptionsLookup, defaultStorageOptionsLookup } from './quotaLookup';

export default function QuotaChanges({
  licencePlate,
  quotaCurrent,
  quotaRequested,
  type,
  cluster,
}: {
  licencePlate: string;
  quotaCurrent: QuotaInput;
  quotaRequested: QuotaInput;
  type: string;
  cluster: string;
}) {
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
          <Text className="mt-2 mb-0 font-medium h-3">Current Quota</Text>
          <Text className="mt-1 mb-0 h-4">{defaultCpuOptionsLookup[quotaCurrent.cpu]}</Text>
          <Text className="mt-2 mb-0 font-medium h-3">Requested Quota</Text>
          <Text className="mt-1 mb-0 h-4">{defaultCpuOptionsLookup[quotaRequested.cpu]}</Text>
        </div>
      )}
    </div>
  );
}
