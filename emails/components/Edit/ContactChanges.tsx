import Image from 'next/image';
import Logo from '../assets/logo.png';
import { Button, Heading, Img, Link, Tailwind, Text } from '@react-email/components';
import { PrivateCloudCreateRequestBody } from '@/schema';
import { TailwindConfig } from '../TailwindConfig';
import { User } from '@prisma/client';

export default function ContactChanges({
  poCurrent,
  tl1Current,
  tl2Current,
  poRequested,
  tl1Requested,
  tl2Requested,
}: {
  poCurrent: User;
  tl1Current: User;
  tl2Current: User | null;
  poRequested: User;
  tl1Requested: User;
  tl2Requested: User | null;
}) {
  return (
    <Tailwind config={TailwindConfig}>
      <div>
        <Heading className="text-lg">Contact Changes</Heading>
        {poCurrent.id !== poRequested.id && (
          <div>
            <Text className="mb-0 font-semibold h-4">Current Product Owner: </Text>
            <Text className="mt-0 mb-0 h-4">
              {poCurrent.firstName} {poCurrent.lastName}
            </Text>
            <Link className="mt-0 h-4" href={`mailto:${poCurrent.email}`}>
              {poCurrent.email}
            </Link>
            <Text className="mb-0 font-semibold h-4">Requested Product Owner: </Text>
            <Text className="mt-0 mb-0 h-4">
              {poRequested.firstName} {poRequested.lastName}
            </Text>
            <Link className="mt-0 h-4" href={`mailto:${poRequested.email}`}>
              {poRequested.email}
            </Link>
          </div>
        )}
        {tl1Current.id !== tl1Requested.id && (
          <div>
            <Text className="mb-0 font-semibold h-4">Current Primary Technical Lead: </Text>
            <Text className="mt-0 mb-0 h-4">
              {tl1Current.firstName} {tl1Current.lastName}
            </Text>
            <Link className="mt-0 h-4" href={`mailto:${tl1Current.email}`}>
              {tl1Current.email}
            </Link>
            <Text className="mb-0 font-semibold h-4">Requested Primary Technical Lead: </Text>
            <Text className="mt-0 mb-0 h-4">
              {tl1Requested.firstName} {tl1Requested.lastName}
            </Text>
            <Link className="mt-0 h-4" href={`mailto:${tl1Requested.email}`}>
              {tl1Requested.email}
            </Link>
          </div>
        )}
        {tl2Current?.id !== tl2Requested?.id && (
          <div>
            <Text className="mb-0 font-semibold h-4">Current Primary Technical Lead: </Text>
            <Text className="mt-0 h-4">
              {tl2Current?.firstName} {tl2Current?.lastName}
            </Text>
            <Link className="mt-0 h-4" href={`mailto:${tl2Current?.email}`}>
              {tl2Current?.email}
            </Link>
            <Text className="mb-0 font-semibold h-4">Requested Primary Technical Lead: </Text>
            <Text className="mt-0 h-4">
              {tl2Requested?.firstName} {tl2Requested?.lastName}
            </Text>
            <Link className="mt-0 h-4" href={`mailto:${tl2Requested?.email}`}>
              {tl2Requested?.email}
            </Link>
          </div>
        )}
      </div>
    </Tailwind>
  );
}
