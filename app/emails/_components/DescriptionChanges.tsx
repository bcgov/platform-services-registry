import { Heading, Text } from '@react-email/components';
import { Organization } from '@/prisma/client';

export default function DescriptionChanges({
  nameCurrent,
  descCurrent,
  ministryCurrent,
  nameRequested,
  descRequested,
  ministryRequested,
  requestedLabel = 'Requested',
}: {
  nameCurrent: string;
  descCurrent: string;
  ministryCurrent: Organization;
  nameRequested: string;
  descRequested: string;
  ministryRequested: Organization;
  requestedLabel?: string;
}) {
  return (
    <div>
      <Heading className="text-lg text-black mb-2">Description Changes</Heading>
      {nameCurrent !== nameRequested && (
        <div className="mb-4">
          <Text className="font-semibold mb-0">Current Product name</Text>
          <Text className="mt-0 mb-0">{nameCurrent}</Text>
          <Text className="font-semibold mt-2 mb-0">{requestedLabel} Product name</Text>
          <Text className="mt-0">{nameRequested}</Text>
        </div>
      )}
      {descCurrent !== descRequested && (
        <div className="mb-4">
          <Text className="font-semibold mb-0">Current Description</Text>
          <Text className="mt-0 mb-0">{descCurrent}</Text>
          <Text className="font-semibold mt-2 mb-0">{requestedLabel} Description</Text>
          <Text className="mt-0">{descRequested}</Text>
        </div>
      )}
      {ministryCurrent !== ministryRequested && (
        <div className="mb-4">
          <Text className="font-semibold mb-0">Current Ministry</Text>
          <Text className="mt-0 mb-0">{ministryCurrent.name}</Text>
          <Text className="font-semibold mt-2 mb-0">{requestedLabel} Ministry</Text>
          <Text className="mt-0">{ministryRequested.name}</Text>
        </div>
      )}
    </div>
  );
}
