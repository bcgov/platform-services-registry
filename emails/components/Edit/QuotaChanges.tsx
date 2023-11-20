import Image from 'next/image';
import Logo from '../assets/logo.png';
import { Button, Heading, Img, Link, Tailwind, Text } from '@react-email/components';
import { QuotaInput } from '@/schema';
import { TailwindConfig } from '../TailwindConfig';

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
    <Tailwind config={TailwindConfig}>
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
            <Text className="mt-2 mb-0 font-semibold h-4">CPU</Text>
            <Text className="mt-0 mb-0 font-medium h-3">Current Quota</Text>
            <Text className="mt-0 mb-0 h-4">{quotaCurrent.cpu}</Text>
            <Text className="mt-1 mb-0 font-medium h-3">Requested Quota</Text>
            <Text className="mt-0 mb-0 h-4">{quotaRequested.cpu}</Text>
          </div>
        )}
        {quotaCurrent.memory !== quotaRequested.memory && (
          <div>
            <Text className="mt-2 mb-0 font-semibold h-4">Memory</Text>
            <Text className="mt-0 mb-0 font-medium h-3">Current Memory</Text>
            <Text className="mt-0 mb-0 h-4">{quotaCurrent.memory}</Text>
            <Text className="mt-1 mb-0 font-medium h-3">Requested Memory</Text>
            <Text className="mt-0 mb-0 h-4">{quotaRequested.memory}</Text>
          </div>
        )}
        {quotaCurrent.storage !== quotaRequested.storage && (
          <div>
            <Text className="mt-2 mb-0 font-semibold h-4">Storage</Text>
            <Text className="mt-0 mb-0 font-medium h-3">Current Storage</Text>
            <Text className="mt-0 mb-0 h-4">{quotaCurrent.storage}</Text>
            <Text className="mt-1 mb-0 font-medium h-3">Requested Storage</Text>
            <Text className="mt-0 mb-0 h-4">{quotaRequested.storage}</Text>
          </div>
        )}
      </div>
    </Tailwind>
  );
}
