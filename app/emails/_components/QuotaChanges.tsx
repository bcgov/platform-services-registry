import { ResourceRequests } from '@prisma/client';
import { Heading, Link, Text } from '@react-email/components';

interface QuotaChangesProps {
  licencePlate: string;
  currentResourceRequests: ResourceRequests;
  requestedResourceRequests: ResourceRequests;
  type: string;
  cluster: string;
  currentLabel?: string;
  requestedLabel?: string;
}

export default function QuotaChanges({
  licencePlate,
  currentResourceRequests,
  requestedResourceRequests,
  type,
  cluster,
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
      {currentResourceRequests.cpu !== requestedResourceRequests.cpu && (
        <div>
          <Text className="mt-4 mb-0 font-semibold h-4">CPU requests (Core)</Text>
          <Text className="mt-1 mb-0 h-4">
            {currentResourceRequests.cpu} &gt; {requestedResourceRequests.cpu}
          </Text>
        </div>
      )}
      {currentResourceRequests.memory !== requestedResourceRequests.memory && (
        <div>
          <Text className="mt-6 mb-0 font-semibold h-4">Memory requests (GB)</Text>
          <Text className="mt-1 mb-0 h-4">
            {currentResourceRequests.memory} &gt; {requestedResourceRequests.memory}
          </Text>
        </div>
      )}
      {currentResourceRequests.storage !== requestedResourceRequests.storage && (
        <div>
          <Text className="mt-6 mb-0 font-semibold h-4">Storage requests (GB)</Text>
          <Text className="mt-1 mb-0 h-4">
            {currentResourceRequests.storage} &gt; {requestedResourceRequests.storage}
          </Text>
        </div>
      )}
    </div>
  );
}
