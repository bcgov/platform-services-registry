'use client';

import { List, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import ExternalLink from '@/components/generic/button/ExternalLink';
import MailLink from '@/components/generic/button/MailLink';
import { privateCloudTeamEmail, publicCloudTeamEmail } from '@/constants';

export default function Landing() {
  return (
    <div className="flex flex-col p-4">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6 tracking-wider">
        Welcome to B.C. Gov&apos;s Platform Product Registry
      </h1>
      <p className="text-xl text-gray-700 mb-6">
        Manage your applications on the Private Cloud OpenShift platform and the Public Cloud Landing Zone.
      </p>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-wider mb-4">
          Make changes to an existing product
        </h2>
        <p className="text-gray-700 mb-4">
          For existing applications hosted on the Private Cloud OpenShift platform or Public Cloud Landing Zone. You can
          update/change all product details, and manage product resource changes (including CPU/RAM/Storage). Resource
          quota increases are subject to admin review.
        </p>
      </section>

      <div className="bg-blue-50 p-4 rounded-md flex items-start mb-12">
        <div className="border-2 border-blue-700 relative w-1 h-1 bg-inherit rounded-full flex justify-center items-center text-center p-2 m-2 mr-4">
          <span className="font-bold text-blue-700 font-sans text-xs">i</span>
        </div>
        <div>
          <p className="text-blue-700 font-semibold">Note for Public Cloud Landing Zone:</p>
          <p className="text-blue-700">
            The approval of a new project set creation request is subject to having a signed Memorandum of Understanding
            (MoU) with the Public Cloud Team. If you do not have a MoU in place, please email us at{' '}
            <MailLink to={publicCloudTeamEmail} />.
          </p>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-wider mb-4">Before you start:</h2>
        <p className="text-gray-700 mb-4">
          This self-serve online tool is for teams who have already attended an onboarding session with the platform
          team.
        </p>
        <p className="text-gray-700 mb-4">If you have not attended an onboarding session, please contact:</p>
        <ul className="list-disc pl-8">
          <li className="mb-2 text-gray-700">
            Private Cloud Platform Administrators <MailLink to={privateCloudTeamEmail} /> to book an{' '}
            <ExternalLink href="https://digital.gov.bc.ca/cloud/services/private/onboard/">
              onboarding session for the (Openshift Platform)
            </ExternalLink>
          </li>
          <li className="mb-2 text-gray-700">
            Public Cloud Platform Administrators <MailLink to={publicCloudTeamEmail} /> to book an{' '}
            <ExternalLink href="https://digital.gov.bc.ca/cloud/services/public/onboard/">
              onboarding session for the (B.C. Government Public Cloud Landing Zone)
            </ExternalLink>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-wider mb-4">What you will need</h2>
        <List
          spacing="sm"
          size="md"
          center
          icon={
            <ThemeIcon color="green" size={16} radius="m">
              <IconCheck size={16} />
            </ThemeIcon>
          }
          className="pl-8 text-gray-700"
        >
          <List.Item>Fulfill the onboarding prerequisites</List.Item>
          <List.Item>
            Have a valid{' '}
            <ExternalLink href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/id-services/idir">
              IDIR
            </ExternalLink>{' '}
            account, which you will use to access the registry
          </List.Item>
          <List.Item>Provide an application name and description without using acronyms</List.Item>
          <List.Item>
            Contact emails tied to an{' '}
            <ExternalLink href="https://www2.gov.bc.ca/gov/content/governments/services-for-government/information-management-technology/id-services/idir">
              IDIR
            </ExternalLink>{' '}
            for the product owner and up to two (2) technical leads
          </List.Item>
          <List.Item>An idea of which common components you will use</List.Item>
          <List.Item>
            Provide an estimate for your project&apos;s projected budget if using AWS <strong>(must be in USD)</strong>
          </List.Item>
        </List>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-wider mb-4">
          Learn more about Private and Public cloud hosting
        </h2>
        <ul className="list-disc pl-8 mb-4">
          <li className="mb-2">
            <ExternalLink href="https://digital.gov.bc.ca/cloud/services/private/intro/">
              Private cloud hosting
            </ExternalLink>
          </li>
          <li className="mb-2">
            <ExternalLink href="https://digital.gov.bc.ca/cloud/services/public/intro/">
              Public cloud hosting
            </ExternalLink>
          </li>
        </ul>
      </section>
    </div>
  );
}
