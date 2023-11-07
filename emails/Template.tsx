import { PrivateCloudCreateRequestBody } from '@/schema';
import * as React from 'react';
import Header from './components/Header';
import ProductDetails from './components/ProductDetails';
import {
  Body,
  Button,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import { Prisma } from '@prisma/client';
const defaultTheme = require('tailwindcss/defaultTheme');

export type PrivateCloudProjectWithContacts = Prisma.PrivateCloudProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
  };
}>;

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';

export const Template = (project: PrivateCloudProjectWithContacts) => {
  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              height: {
                18: '4.35rem',
                17: '4.3rem',
                'screen-60': '80vh',
              },
              colors: {
                bcblue: '#003366',
                bcorange: '#FCBA19',
                darkergrey: '#344054',
                mediumgrey: '#475467',
                tableheadergrey: 'rgba(214, 216, 213, 0.15)',
                tablebordergrey: '#EAECF0',
                disabledborder: 'D0D5DD',
                cloudgrey: '#667085',
                divider: '#0000001f',
                linkblue: '#155EEF',
              },
              borderWidth: {
                1: '1px',
                3: '3px',
              },
              textColor: {
                deselected: 'rgba(102, 112, 133, 0.44)',
              },
              fontFamily: {
                sans: ['Inter var', ...defaultTheme.fontFamily.sans],
                roboto: ['Roboto', ...defaultTheme.fontFamily.sans],
                bcsans: ['BCSans', 'sans-serif'],
              },
              maxWidth: {
                test: '40%',
              },
            },
          },
        }}
      >
        <div className="border border-solid border-[#eaeaea] rounded my-4 mx-auto p-4 max-w-xl">
          <Header />
          <Body className="bg-white my-auto mx-auto font-sans text-xs">
            <div className="m-12">
              <div>
                <Heading className="text-lg">New Provisioning Request!</Heading>
                <Text>Hi Registry Team, </Text>
                <Text className="">
                  There is a new request that requires your review. Log in to the Registry to review the details. If you
                  have any questions about the request, the PO and TL contact details are included below and in the
                  Registry
                </Text>
                <Button className="bg-bcorange rounded-md px-4 py-2 text-white">Review Request</Button>
              </div>
              <ProductDetails data={project} />
            </div>
          </Body>
        </div>
      </Tailwind>
    </Html>
  );
};

export default Template;

// if (!formData) {
//   formData = {
//     name: 'placeholder',
//     description: 'placeholder',
//     cluster: 'KLAB',
//     ministry: 'CITZ',
//     projectOwner: {
//       firstName: 'John',
//       lastName: 'Doe',
//       email: 'john.doe@gov.bc.ca',
//       ministry: 'CITZ',
//     },
//     primaryTechnicalLead: {
//       firstName: 'Jane',
//       lastName: 'Doe',
//       email: 'sarah.williams@gov.bc.ca',
//       ministry: 'CITZ',
//     },
//     commonComponents: {
//       addressAndGeolocation: { planningToUse: true, implemented: false },
//       workflowManagement: { planningToUse: false, implemented: false },
//       formDesignAndSubmission: { planningToUse: false, implemented: false },
//       identityManagement: { planningToUse: false, implemented: false },
//       paymentServices: { planningToUse: false, implemented: false },
//       documentManagement: { planningToUse: false, implemented: false },
//       endUserNotificationAndSubscription: { planningToUse: false, implemented: false },
//       publishing: { planningToUse: false, implemented: false },
//       businessIntelligence: { planningToUse: false, implemented: false },
//       other: '',
//       noServices: false,
//     },
//   };
// }
