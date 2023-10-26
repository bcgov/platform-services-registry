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
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Join <strong>{formData.projectOwner.email}</strong> on <strong>Vercel</strong>
            </Heading>

            <Header />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Template;
