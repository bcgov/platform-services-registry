import { PublicCloudRequestWithRequestedProject } from '@/request-actions/public-cloud/decision-request';
import * as React from 'react';
import Header from '../../_components/Header';
import ProductDetails from '../../_components/ProductDetails';
import { Body, Button, Heading, Html, Img, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import ProviderDetails from '../../_components/ProviderDetails';
import { TailwindConfig } from '../../_components/TailwindConfig';
interface EmailProp {
  request: PublicCloudRequestWithRequestedProject;
}

const NewRequestTemplate = ({ request }: EmailProp) => {
  if (!request) return <></>;

  const {
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    provider,
    accountCoding,
    budget,
    licencePlate,
  } = request.requestedProject;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg">New Request!</Heading>
                <Text>Hi Public Cloud Team, </Text>
                <Text className="">
                  There is a new request that requires your review. Log in to the Registry to review the details. If you
                  have any questions about the request, the PO and TL contact details are included below and in the
                  Registry
                </Text>
                <Button
                  href="https://registry.developer.gov.bc.ca/public-cloud/requests/active"
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  Review Request
                </Button>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <ProductDetails
                  name={name}
                  description={description}
                  ministry={ministry}
                  po={projectOwner}
                  tl1={primaryTechnicalLead}
                  tl2={secondaryTechnicalLead}
                  expenseAuthority={request.requestedProject.expenseAuthority}
                  licencePlate={licencePlate}
                />
              </div>
              <div>
                <ProviderDetails provider={provider} accountCoding={accountCoding} budget={budget} />
              </div>
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default NewRequestTemplate;
