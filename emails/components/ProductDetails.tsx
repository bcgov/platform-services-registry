import Image from 'next/image';
import Logo from '../assets/logo.png';
import { Button, Heading, Img, Link, Text } from '@react-email/components';
import { PrivateCloudCreateRequestBody } from '@/schema';
import { PrivateCloudProjectWithContacts } from '@/emails/Template';

export default function ProductDetails(project: PrivateCloudProjectWithContacts) {
  return (
    <div>
      <Heading className="text-lg">Product Details</Heading>
      <div>
        <Text className="mb-0 font-bold h-4">Product Name: </Text>
        <Text className="mt-0 h-4">{project.name}</Text>
      </div>
      <div>
        <Text className="mb-0 font-bold h-4">Product Description: </Text>
        <Text className="mt-0 h-4">{project.description}</Text>
      </div>
      <div>
        <Text className="mb-0 font-bold h-4">Ministry: </Text>
        <Text className="mt-0 h-4">{project.ministry}</Text>
      </div>
      <div>
        <Text className="mb-0 font-bold h-4">Product Owner: </Text>
        <Text className="mt-0 mb-0 h-4">
          {project.projectOwner.firstName} {project.projectOwner.lastName}
        </Text>
        <Link className="mt-0 h-4" href={`mailto:${project.projectOwner.email}`}>
          {project.projectOwner.email}
        </Link>
      </div>
      <div>
        <Text className="mb-0 font-bold h-4">Product Owner: </Text>
        <Text className="mt-0 mb-0 h-4">
          {project.primaryTechnicalLead.firstName} {project.primaryTechnicalLead.lastName}
        </Text>
        <Link className="mt-0 h-4" href={`mailto:${project.primaryTechnicalLead.email}`}>
          {project.primaryTechnicalLead.email}
        </Link>
      </div>
    </div>
  );
}
