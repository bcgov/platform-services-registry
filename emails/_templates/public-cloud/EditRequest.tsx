import { PublicCloudRequestWithProjectAndRequestedProject } from '@/requestActions/public-cloud/decisionRequest';
import * as React from 'react';
import Header from '../../_components/Header';
import { Body, Button, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';
import { comparePublicCloudProjects } from '../../_components/Edit/utils/compareProjects';
import ContactChanges from '../../_components/Edit/ContactChanges';
import QuotaChanges from '../../_components/Edit/QuotaChanges';
import DescriptionChanges from '../../_components/Edit/DescriptionChanges';
import BudgetChanges from '../../_components/Edit/BudgetChanges';

interface EmailProp {
  request: PublicCloudRequestWithProjectAndRequestedProject;
  comment?: string;
}

const EditRequestTemplate = ({ request, comment }: EmailProp) => {
  if (!request || !request.project || !request.requestedProject) return <></>;
  const current = request.project;
  const requested = request.requestedProject;
  const changed = comparePublicCloudProjects(current, requested);

  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs text-darkergrey">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">New Edit Product Request!</Heading>
                <Text>Hi {current.name} Team, </Text>
                <Text className="">
                  You have submitted an edit request for your product with the license plate {request.licencePlate}. Our
                  administrators have been notified and will review your request.
                </Text>
                <Button
                  href={'https://registry.developer.gov.bc.ca/public-cloud/products/active-requests'}
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  Review Request
                </Button>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Comments</Heading>
                <Text className="mb-0">{comment}</Text>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                {(changed.name || changed.description || changed.ministry) && (
                  <DescriptionChanges
                    nameCurrent={current.name}
                    descCurrent={current.description}
                    ministryCurrent={current.ministry}
                    nameRequested={requested.name}
                    descRequested={requested.description}
                    ministryRequested={requested.ministry}
                  />
                )}
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                {(changed.projectOwnerId || changed.primaryTechnicalLeadId || changed.secondaryTechnicalLeadId) && (
                  <ContactChanges
                    poCurrent={current.projectOwner}
                    tl1Current={current.primaryTechnicalLead}
                    tl2Current={current?.secondaryTechnicalLead}
                    poRequested={requested.projectOwner}
                    tl1Requested={requested.primaryTechnicalLead}
                    tl2Requested={requested?.secondaryTechnicalLead}
                  />
                )}
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                {(changed.accountCoding || changed.budget) && (
                  <BudgetChanges
                    budgetCurrent={current.budget}
                    budgetRequested={requested.budget}
                    accountCodingCurrent={current.accountCoding}
                    accountCodingRequested={requested.accountCoding}
                  />
                )}
              </div>
              <div>
                <Closing email="Cloud.Pathfinder@gov.bc.ca" />
              </div>
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default EditRequestTemplate;
