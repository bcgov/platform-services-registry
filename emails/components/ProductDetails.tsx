import Image from 'next/image';
import Logo from '../assets/logo.png';
import { Button, Heading, Img, Link, Tailwind, Text } from '@react-email/components';
import { PrivateCloudCreateRequestBody } from '@/schema';
import { TailwindConfig } from './TailwindConfig';
import { User } from '.prisma/client';

export default function ProductDetails({
  name,
  description,
  ministry,
  po,
  tl1,
  tl2,
}: {
  name: string;
  description: string;
  ministry: string;
  po: User;
  tl1: User;
  tl2?: User;
}) {
  return (
    <Tailwind config={TailwindConfig}>
      <div>
        <Heading className="text-lg">Product Details</Heading>
        <div>
          <Text className="mb-0 font-semibold h-4">Product Name: </Text>
          <Text className="mt-0 h-4">{name}</Text>
          <Text className="mb-0 font-semibold h-4">Product Description: </Text>
          <Text className="mt-0 h-4">{description}</Text>
          <Text className="mb-0 font-semibold h-4">Ministry: </Text>
          <Text className="mt-0 h-4">{ministry}</Text>
          <Text className="mb-0 font-semibold h-4">Product Owner: </Text>
          <Text className="mt-0 mb-0 h-4">
            {po.firstName} {po.lastName}
          </Text>
          <Link className="mt-0 h-4" href={`mailto:${po.email}`}>
            {po.email}
          </Link>
          <Text className="mb-0 font-semibold h-4">Product Owner: </Text>
          <Text className="mt-0 mb-0 h-4">
            {tl1.firstName} {tl1.lastName}
          </Text>
          <Link className="mt-0 h-4" href={`mailto:${tl1.email}`}>
            {tl1.email}
          </Link>
        </div>
      </div>
    </Tailwind>
  );
}
