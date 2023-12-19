import { Heading, Text } from '@react-email/components';

export default function NamespaceDetails({ provider }: { provider: string }) {
  return (
    <div>
      <Heading className="text-lg">Namespace Details</Heading>
      <div>
        <Text className="mb-0 font-semibold h-4">OpenShift Cluster: </Text>
        <Text className="mt-0 h-4">{provider}</Text>
      </div>
    </div>
  );
}
