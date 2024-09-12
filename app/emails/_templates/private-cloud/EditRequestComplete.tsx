import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestedProjectWithContacts } from '@/services/nats/private-cloud';

interface EmailProp {
  product: PrivateCloudRequestedProjectWithContacts;
}

const EditRequestCompleteTemplate = ({ product }: EmailProp) => {
  if (!product) return <></>;

  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Your edit request has been completed!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>The project set edit request for {product.name} has been successfully completed.</Text>

      <Hr className="my-4" />

      <ProductDetails
        name={product.name}
        description={product.description}
        ministry={product.ministry}
        po={product.projectOwner}
        tl1={product.primaryTechnicalLead}
        tl2={product.secondaryTechnicalLead}
      />

      <Hr className="my-4" />

      <NamespaceDetails cluster={product.cluster} licencePlate={product.licencePlate} />
    </PrivateCloudLayout>
  );
};

export default EditRequestCompleteTemplate;
