import { PublicCloudRequestWithProjectAndRequestedProject } from '@/requestActions/public-cloud/decisionRequest';
import * as React from 'react';
import Header from '../../_components/Header';
import { Body, Button, Heading, Html, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import Closing from '../../_components/Closing';
import { TailwindConfig } from '../../_components/TailwindConfig';
import { comparePublicCloudProjects } from '../../_components/Edit/utils/compareProjects';
import ContactChanges from '../../_components/Edit/ContactChanges';
import DescriptionChanges from '../../_components/Edit/DescriptionChanges';
import BudgetChanges from '../../_components/Edit/BudgetChanges';

interface EmailProp {
  request: PublicCloudRequestWithProjectAndRequestedProject;
  comment?: string;
}

const EditSummaryTemplate = ({ request, comment }: EmailProp) => {
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
                <Heading className="text-lg text-black">Your Edit Summary!</Heading>
                <Text>Hi {current.name} Team, </Text>
                <Text className="">
                  You have edited your product in the Public Cloud Landing Zone with the license plate{' '}
                  {request.licencePlate}. Here is a summary of your changes.
                </Text>
                <Button
                  href={'https://registry.developer.gov.bc.ca/public-cloud/products/active-requests'}
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  View Changes
                </Button>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg text-black">Comments</Heading>
                <Text className="mb-0">{comment}</Text>
              </div>
              {(changed.name || changed.description || changed.ministry) && (
                <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                  <DescriptionChanges
                    nameCurrent={current.name}
                    descCurrent={current.description}
                    ministryCurrent={current.ministry}
                    nameRequested={requested.name}
                    descRequested={requested.description}
                    ministryRequested={requested.ministry}
                    requestedLabel="Updated"
                  />
                </div>
              )}
              {(changed.projectOwnerId || changed.primaryTechnicalLeadId || changed.secondaryTechnicalLeadId) && (
                <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                  <ContactChanges
                    poCurrent={current.projectOwner}
                    tl1Current={current.primaryTechnicalLead}
                    tl2Current={current?.secondaryTechnicalLead}
                    poRequested={requested.projectOwner}
                    tl1Requested={requested.primaryTechnicalLead}
                    tl2Requested={requested?.secondaryTechnicalLead}
                    requestedLabel="Updated"
                  />
                </div>
              )}
              {(changed.accountCoding || changed.budget) && (
                <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                  <BudgetChanges
                    budgetCurrent={current.budget}
                    budgetRequested={requested.budget}
                    accountCodingCurrent={current.accountCoding}
                    accountCodingRequested={requested.accountCoding}
                  />
                </div>
              )}
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

export default EditSummaryTemplate;
