import * as React from 'react';
import Header from '../../_components/Header';
import { Body, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';
import ProductDetails from '../../_components/ProductDetails';
import ProviderDetails from '../../_components/ProviderDetails';
import { PublicCloudRequestedProjectWithContacts } from '@/services/nats/public-cloud';

interface EmailProp {
  product: PublicCloudRequestedProjectWithContacts;
}

const DeleteApprovalTemplate = ({ product }: EmailProp) => {
  if (!product) return <></>;

  const {
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    provider,
    accountCoding,
    budget,
    licencePlate,
  } = product;

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">
                  Your deletion request has been sent to our platform administrators!
                </Heading>
                <Text>Hi Product Team,</Text>
                <Text className="">
                  We acknowledge the receipt of your deletion request for the Sample Project&apos;s project set. This
                  request has been communicated to our platform administrators, who will take the necessary actions to
                  delete the specified project set.
                </Text>
                <Text className="">
                  Please be informed that until the deletion process is completed, the project set will continue to
                  incur charges for the utilized resources. We are committed to processing your request promptly to
                  minimize any additional expenses.
                </Text>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <ProductDetails
                  name={name}
                  description={description}
                  ministry={ministry}
                  po={projectOwner}
                  tl1={primaryTechnicalLead}
                  tl2={secondaryTechnicalLead}
                  expenseAuthority={expenseAuthority}
                  licencePlate={licencePlate}
                />
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <ProviderDetails provider={provider} accountCoding={accountCoding} budget={budget} />
              </div>
              <div>
                <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
              </div>
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default DeleteApprovalTemplate;
