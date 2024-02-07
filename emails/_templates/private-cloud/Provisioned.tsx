import * as React from 'react';
import Header from '../../_components/Header';
import { Link, Body, Button, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';
import ProductDetails from '../../_components/ProductDetails';
import NamespaceDetails from '../../_components/NamespaceDetails';
import { PrivateCloudRequestedProjectWithContacts } from '@/nats/privateCloud';

interface EmailProp {
  product: PrivateCloudRequestedProjectWithContacts;
}

const ProvisionedTemplate = ({ product }: EmailProp) => {
  if (!product) return <></>;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Hurray! Your request was approved and completed!</Heading>
                <Text>Hi {product.name} Team, </Text>
                <Text className="">
                  Your request for your product on the Private Cloud Openshift platform is complete.{' '}
                  <Link className="mt-0 h-4" href={`https://console.apps.${product.cluster}.devops.gov.bc.ca/`}>
                    Log in to the cluster console
                  </Link>{' '}
                  using the button below and you&apos;ll see all four namespaces included in a project set. If you have
                  any more questions reach out to the Platform Services team in the RocketChat channel{' '}
                  <Link className="mt-0 h-4" href={`https://chat.developer.gov.bc.ca/channel/devops-operations`}>
                    #devops&#8209;operations
                  </Link>
                </Text>
                <Text className="">
                  The Product Owner and the Technical Lead have been provisioned with admin access to the namespaces
                  below, and can add other users as necessary. Please note that if a Product Owner or a Technical Lead
                  is removed as a project contact in the Platform Registry, they will lose their access to the project
                  set namespaces in Openshift. The new Product or Technical Lead provided on the product details page
                  will gain the administrative access to the namespaces.
                </Text>
                <Button
                  href={`https://console.apps.${product.cluster}.devops.gov.bc.ca/`}
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  Log in to console
                </Button>
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
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default ProvisionedTemplate;
