import { Heading, Text, Hr } from '@react-email/components';
import * as React from 'react';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudProductDetail } from '@/types/private-cloud';

interface EmailProp {
  product: PrivateCloudProductDetail;
}

export default function DeleteApproval({ product }: EmailProp) {
  if (!product) return <></>;

  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Your deletion request has been completed!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>{`The project set deletion for ${product.name} has been successfully completed.`}</Text>

      <Hr className="my-4" />

      <ProductDetails
        name={product.name}
        description={product.description}
        ministry={product.ministry}
        po={product.projectOwner}
        tl1={product.primaryTechnicalLead}
        tl2={product.secondaryTechnicalLead}
      />

      <NamespaceDetails cluster={product.cluster} licencePlate={product.licencePlate} />
    </PrivateCloudLayout>
  );
}
