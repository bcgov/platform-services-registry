import { Heading, Text } from '@react-email/components';
import * as React from 'react';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';
import NamespaceDetails from '@/emails/_components/NamespaceDetails';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PrivateCloudRequestedProjectWithContacts } from '@/services/nats/private-cloud';

interface EmailProp {
  product: PrivateCloudRequestedProjectWithContacts;
}

const EditRequestCompleteTemplate = ({ product }: EmailProp) => {
  if (!product) return <></>;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg text-black">Your edit request has been completed!</Heading>
        <Text>Hi Product Team,</Text>
        <Text className="">{`The project set edit request for ${product.name} has been successfully completed.`}</Text>
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProductDetails
          name={product.name}
          description={product.description}
          ministry={product.ministry}
          po={product.projectOwner}
          tl1={product.primaryTechnicalLead}
          tl2={product.secondaryTechnicalLead}
        />
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <NamespaceDetails cluster={product.cluster} licencePlate={product.licencePlate} />
      </div>
      <div>
        <Closing />
      </div>
    </Layout>
  );
};

export default EditRequestCompleteTemplate;
