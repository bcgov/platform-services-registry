import { Heading, Text } from '@react-email/components';

export default function NamespaceDetails({ provider }: { provider: string }) {
  return (
    <div>
      <Heading className="text-lg">Landing Zone Details</Heading>
      <div>
        <Text className="mb-1 font-semibold h-4">Provider: </Text>
        <Text className="mt-0 h-4">{provider}</Text>
      </div>
    </div>
  );
}
