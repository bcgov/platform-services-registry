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
      <Heading className="text-lg text-black">Description Changes</Heading>
      {nameCurrent !== nameRequested && (
        <div>
          <Text className="mt-4 mb-0 font-semibold h-4">Product Name</Text>
          <Text className="mt-2 mb-0 font-semibold h-4">Current Product Name</Text>
          <Text className="mt-1 mb-0 h-4">{nameCurrent}</Text>
          <Text className="mt-2 mb-0 font-semibold h-4">Requested Product Name</Text>
          <Text className="mt-1 mb-0 h-4">{nameRequested}</Text>
        </div>
      )}
      {descCurrent !== descRequested && (
        <div>
          <Text className="mt-6 mb-0 font-semibold h-4">Product Description</Text>
          <Text className="mt-2 mb-0 font-semibold h-4">Current Description</Text>
          <Text className="mt-1 mb-0 h-4">{descCurrent}</Text>
          <Text className="mt-2 mb-0 font-semibold h-4">Requested Description</Text>
          <Text className="mt-1 mb-0 h-4">{descRequested}</Text>
        </div>
      )}
      <div className="flex flex-row flex-wrap mt-4">
        {ministryCurrent !== ministryRequested && (
          <div className="mr-16">
            <Text className="mt-6 mb-0 font-semibold h-4">Ministry</Text>
            <Text className="mt-2 mb-0 font-medium h-3">Current Ministry</Text>
            <Text className="mt-1 mb-0 h-4">{ministryCurrent}</Text>
            <Text className="mt-2 mb-0 font-medium h-3">Requested Ministry</Text>
            <Text className="mt-1 mb-0 h-4">{ministryRequested}</Text>
          </div>
        )}
      </div>
    </div>
  );
}
