import Image from 'next/image';
import Logo from '../assets/logo.png';
import { Button, Heading, Img, Link, Tailwind, Text } from '@react-email/components';
import { PrivateCloudCreateRequestBody } from '@/schema';
import { TailwindConfig } from '../TailwindConfig';
import { User } from '@prisma/client';

export default function DescriptionChanges({
  nameCurrent,
  descCurrent,
  ministryCurrent,
  clusterCurrent,
  nameRequested,
  descRequested,
  ministryRequested,
  clusterRequested,
}: {
  nameCurrent: String;
  descCurrent: String;
  ministryCurrent: String;
  clusterCurrent: String;
  nameRequested: String;
  descRequested: String;
  ministryRequested: String;
  clusterRequested: String;
}) {
  return (
    <Tailwind config={TailwindConfig}>
      <div>
        <Heading className="text-lg text-black">Description Changes</Heading>
        {nameCurrent !== nameRequested && (
          <div>
            <Text className="mb-0 font-semibold h-4">Product Name</Text>
            <Text className="mt-1 mb-0 font-semibold h-4">Current Product Name</Text>
            <Text className="mt-0 mb-0 h-4">{nameCurrent}</Text>
            <Text className="mt-1 mb-0 font-semibold h-4">Requested Product Name</Text>
            <Text className="mt-0 mb-0 h-4">{nameRequested}</Text>
          </div>
        )}
        {descCurrent !== descRequested && (
          <div>
            <Text className="mb-0 font-semibold h-4">Product Description</Text>
            <Text className="mt-1 mb-0 font-semibold h-4">Current Description</Text>
            <Text className="mt-0 mb-0 h-4">{descCurrent}</Text>
            <Text className="mt-1 mb-0 font-semibold h-4">Requested Description</Text>
            <Text className="mt-0 mb-0 h-4">{descRequested}</Text>
          </div>
        )}
        <div className="flex flex-row flex-wrap mt-4">
          {ministryCurrent !== ministryRequested && (
            <div className="mr-16">
              <Text className="mt-2 mb-0 font-semibold h-4">Ministry</Text>
              <Text className="mt-0 mb-0 font-medium h-3">Current Ministry</Text>
              <Text className="mt-0 mb-0 h-4">{ministryCurrent}</Text>
              <Text className="mt-1 mb-0 font-medium h-3">Requested Ministry</Text>
              <Text className="mt-0 mb-0 h-4">{ministryRequested}</Text>
            </div>
          )}
          {clusterCurrent !== clusterRequested && (
            <div>
              <Text className="mt-2 mb-0 font-semibold h-4">Cluster</Text>
              <Text className="mt-0 mb-0 font-medium h-3">Current Cluster</Text>
              <Text className="mt-0 mb-0 h-4">{clusterCurrent}</Text>
              <Text className="mt-1 mb-0 font-medium h-3">Requested Cluster</Text>
              <Text className="mt-0 mb-0 h-4">{clusterRequested}</Text>
            </div>
          )}
        </div>
      </div>
    </Tailwind>
  );
}
