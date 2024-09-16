import { Heading, Text, Hr, Link } from '@react-email/components';
import * as React from 'react';
import PrivateCloudLayout from '@/emails/_components/layout/PrivateCloudLayout';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudProductDetail } from '@/types/private-cloud';

interface EmailProp {
  product: PrivateCloudProductDetail;
}

export default function EditRequestComplete({ product }: EmailProp) {
  if (!product) return <></>;

  return (
    <PrivateCloudLayout>
      <Heading className="text-lg text-black">Your edit request has been completed!</Heading>
      <Text>Hi Product Team,</Text>
      <Text>
        The project set edit request for {product.name} has been successfully completed. You can now log in to{' '}
        <Link className="mt-0 h-4" href={`https://console.apps.${product.cluster}.devops.gov.bc.ca/`}>
          OpenShift cluster console{' '}
        </Link>{' '}
        and you will see your new resource quota values.
      </Text>

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
}
