import { Heading, Text } from '@react-email/components';

export default function DescriptionChanges({
  nameCurrent,
  descCurrent,
  ministryCurrent,
  nameRequested,
  descRequested,
  ministryRequested,
}: {
  nameCurrent: string;
  descCurrent: string;
  ministryCurrent: string;
  nameRequested: string;
  descRequested: string;
  ministryRequested: string;
}) {
  return (
    <div>
      <Heading className="text-lg text-black mb-2">Description Changes</Heading>
      {nameCurrent !== nameRequested && (
        <div className="mb-4">
          <Text className="font-semibold">Current Product Name</Text>
          <Text>{nameCurrent}</Text>
          <Text className="font-semibold mt-2">Requested Product Name</Text>
          <Text>{nameRequested}</Text>
        </div>
      )}
      {descCurrent !== descRequested && (
        <div className="mb-4">
          <Text className="font-semibold">Current Description</Text>
          <Text>{descCurrent}</Text>
          <Text className="font-semibold mt-2">Requested Description</Text>
          <Text>{descRequested}</Text>
        </div>
      )}
      {ministryCurrent !== ministryRequested && (
        <div className="mb-4">
          <Text className="font-semibold">Current Ministry</Text>
          <Text>{ministryCurrent}</Text>
          <Text className="font-semibold mt-2">Requested Ministry</Text>
          <Text>{ministryRequested}</Text>
        </div>
      )}
    </div>
  );
}
