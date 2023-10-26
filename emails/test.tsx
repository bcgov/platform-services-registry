import { PrivateCloudCreateRequestBody } from '@/schema';
import * as React from 'react';
import Header from './components/Header';
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
const defaultTheme = require('tailwindcss/defaultTheme');

const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';

interface EmailProp {
  formData: PrivateCloudCreateRequestBody;
}

export const Template = ({ formData }: EmailProp) => {
  if (!formData) {
    formData = {
      name: 'placeholder',
      description: 'placeholder',
      cluster: 'KLAB',
      ministry: 'CITZ',
      projectOwner: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gov.bc.ca',
        ministry: 'CITZ',
      },
      primaryTechnicalLead: {
        firstName: '',
        lastName: 'Jane',
        email: 'sarah.williams@gov.bc.ca',
        ministry: 'CITZ',
      },
      commonComponents: {
        addressAndGeolocation: { planningToUse: true, implemented: false },
        workflowManagement: { planningToUse: false, implemented: false },
        formDesignAndSubmission: { planningToUse: false, implemented: false },
        identityManagement: { planningToUse: false, implemented: false },
        paymentServices: { planningToUse: false, implemented: false },
        documentManagement: { planningToUse: false, implemented: false },
        endUserNotificationAndSubscription: { planningToUse: false, implemented: false },
        publishing: { planningToUse: false, implemented: false },
        businessIntelligence: { planningToUse: false, implemented: false },
        other: '',
        noServices: false,
      },
    };
  }

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
        <style>
          {`@tailwind base;
          @tailwind components;
          @tailwind utilities;`}
        </style>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Header />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Template;
