import Image from 'next/image';
import Logo from '../assets/logo.png';
import { Button, Heading, Img, Link, Text } from '@react-email/components';
import { PrivateCloudCreateRequestBody } from '@/schema';

export default function NamespaceDetails({ cluster, licencePlate }: { cluster: any; licencePlate?: any }) {
  return (
    <div>
      <Heading className="text-lg">Namespace Details</Heading>
      <div>
        <Text className="mb-0 font-semibold h-4">OpenShift Cluster: </Text>
        <Text className="mt-0 h-4">{cluster}</Text>
      </div>
      {licencePlate && (
        <>
          <Text className="mb-0 font-semibold h-4">Development Namespace: </Text>
          <Text className="mt-0 h-4">{licencePlate}-dev</Text>
          <Text className="mb-0 font-semibold h-4">Test Namespace: </Text>
          <Text className="mt-0 h-4">{licencePlate}-test</Text>
          <Text className="mb-0 font-semibold h-4">Production Namespace: </Text>
          <Text className="mt-0 h-4">{licencePlate}-prod</Text>
          <Text className="mb-0 font-semibold h-4">Tools Namespace: </Text>
          <Text className="mt-0 h-4">{licencePlate}-tools</Text>
        </>
      )}
    </div>
  );
}
