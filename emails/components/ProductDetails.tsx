import Image from 'next/image';
import Logo from '../assets/logo.png';
import { Button, Heading, Img, Link, Text } from '@react-email/components';
import { PrivateCloudCreateRequestBody } from '@/schema';

interface EmailProp {
  data: PrivateCloudCreateRequestBody;
}

export default function Header({ data }: EmailProp) {
  return (
    <div>
      <Heading className="text-lg">Product Details</Heading>
      <div>
        <Text className="mb-0 font-bold h-4">Product Name: </Text>
        <Text className="mt-0 h-4">{data.name}</Text>
      </div>
      <div>
        <Text className="mb-0 font-bold h-4">Product Description: </Text>
        <Text className="mt-0 h-4">{data.description}</Text>
      </div>
      <div>
        <Text className="mb-0 font-bold h-4">Ministry: </Text>
        <Text className="mt-0 h-4">{data.ministry}</Text>
      </div>
      <div>
        <Text className="mb-0 font-bold h-4">Product Owner: </Text>
        <Text className="mt-0 mb-0 h-4">
          {data.projectOwner.firstName} {data.projectOwner.lastName}
        </Text>
        <Link className="mt-0 h-4" href={`mailto:${data.projectOwner.email}`}>
          {data.projectOwner.email}
        </Link>
      </div>
      <div>
        <Text className="mb-0 font-bold h-4">Product Owner: </Text>
        <Text className="mt-0 mb-0 h-4">
          {data.primaryTechnicalLead.firstName} {data.primaryTechnicalLead.lastName}
        </Text>
        <Link className="mt-0 h-4" href={`mailto:${data.primaryTechnicalLead.email}`}>
          {data.primaryTechnicalLead.email}
        </Link>
      </div>
    </div>
  );
}
