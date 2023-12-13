import { PrivateCloudRequestWithRequestedProject } from '@/requestActions/private-cloud/decisionRequest';
import * as React from 'react';
import Header from '../../components/Header';
import ProductDetails from '../../components/ProductDetails';
import { Body, Button, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import NamespaceDetails from '../../components/NamespaceDetails';
import Closing from '../../components/Closing';
import { TailwindConfig } from '../../components/TailwindConfig';

interface EmailProp {
  request: PrivateCloudRequestWithRequestedProject;
}

export const RequestApprovalTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">
                  Hurray! Your provisioning request was approved and completed!
                </Heading>
                <Text>Hi {request.requestedProject.projectOwner.firstName}, </Text>
                <Text className="">
                  Your request for a new project set for your product on the Private Cloud Openshift platform is
                  complete. Log in to the cluster console using the button below and you&apos;ll see all four namespaces
                  included in a project set. If you have any more questions, reach out to the Platform Services team in
                  the RocketChat channel #devops-operations.
                </Text>
                <Text className="">
                  The Product Owner and the Technical Lead have been provisioned with admin access to the namespaces
                  below and can add other users as necessary. Please note that if a Product Owner or a Technical Lead is
                  removed as a project contact in the Platform Registry, they will lost their access to the projcect set
                  namespaces in Openshift. The new Product or Technical Lead provided on the product details page will
                  gain the administrative access to the namespaces.
                </Text>
                <Button
                  href="https://registry.developer.gov.bc.ca/private-cloud/products/all"
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  Log in to Console
                </Button>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <ProductDetails
                  name={request.requestedProject.name}
                  description={request.requestedProject.description}
                  ministry={request.requestedProject.ministry}
                  po={request.requestedProject.projectOwner}
                  tl1={request.requestedProject.primaryTechnicalLead}
                  tl2={request.requestedProject.secondaryTechnicalLead}
                />
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <NamespaceDetails cluster={request.requestedProject.cluster} licencePlate={request.licencePlate} />
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

export default RequestApprovalTemplate;
