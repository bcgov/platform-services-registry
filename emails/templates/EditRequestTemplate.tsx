import {
  PrivateCloudRequestWithProjectAndRequestedProject,
  PrivateCloudRequestWithRequestedProject,
} from '@/requestActions/private-cloud/decisionRequest';
import * as React from 'react';
import Header from '../components/Header';
import ProductDetails from '../components/ProductDetails';
import { Body, Button, Heading, Html, Img, Text } from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import NamespaceDetails from '../components/NamespaceDetails';
import Closing from '../components/Closing';
import { TailwindConfig } from '../components/TailwindConfig';
import { compareProjects } from '../components/Edit/compareProjects';
import ContactChanges from '../components/Edit/ContactChanges';
import QuotaChanges from '../components/Edit/QuotaChanges';
const defaultTheme = require('tailwindcss/defaultTheme');

interface EmailProp {
  request: PrivateCloudRequestWithProjectAndRequestedProject;
}

export const EditRequestTemplate = ({ request }: EmailProp) => {
  if (!request || !request.project || !request.requestedProject) return <></>;
  const current = request.project;
  const requested = request.requestedProject;
  const changed = compareProjects(current, requested);
  // console.log(changed)
  return (
    <Html>
      <Tailwind config={TailwindConfig}>
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs">
            <div className="m-12">
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                <Heading className="text-lg">New Edit Product Request!</Heading>
                <Text>Hi Registry Team, </Text>
                <Text className="">
                  You have submitted an edit request for your product with the license plate
                  {request.licencePlate}. Our administrators have been notified and will review your request.
                </Text>
                <Button
                  href="https://dev-pltsvc.apps.silver.devops.gov.bc.ca/private-cloud/products"
                  className="bg-bcorange rounded-md px-4 py-2 text-white"
                >
                  Review Request
                </Button>
              </div>
              <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
                {(changed['projectOwnerId'] ||
                  changed['primaryTechnicalLeadId'] ||
                  changed['secondaryTechnicalLeadId']) && (
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
                {(changed['productionQuota'] ||
                  changed['testQuota'] ||
                  changed['developmentQuota'] ||
                  changed['toolsQuota']) && <Heading className="text-lg mb-0">Quota Changes</Heading>}
                <div className="flex flex-row flex-wrap">
                  {changed['productionQuota'] && (
                    <QuotaChanges
                      licencePlate={`${request.licencePlate}-prod`}
                      quotaCurrent={current.productionQuota}
                      quotaRequested={requested.productionQuota}
                      type="Production"
                      cluster={current.cluster}
                    />
                  )}
                  {changed['testQuota'] && (
                    <QuotaChanges
                      licencePlate={`${request.licencePlate}-test`}
                      quotaCurrent={current.testQuota}
                      quotaRequested={requested.testQuota}
                      type="Test"
                      cluster={current.cluster}
                    />
                  )}
                  {changed['developmentQuota'] && (
                    <QuotaChanges
                      licencePlate={`${request.licencePlate}-dev`}
                      quotaCurrent={current.testQuota}
                      quotaRequested={requested.testQuota}
                      type="Development"
                      cluster={current.cluster}
                    />
                  )}
                  {changed['toolsQuota'] && (
                    <QuotaChanges
                      licencePlate={`${request.licencePlate}-tools`}
                      quotaCurrent={current.testQuota}
                      quotaRequested={requested.testQuota}
                      type="Tools"
                      cluster={current.cluster}
                    />
                  )}
                </div>
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

export default EditRequestTemplate;
