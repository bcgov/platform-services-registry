'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import LoginButton from '@/components/buttons/LoginButton';
import RegisterProductButton from '@/components/buttons/RegisterProductButton';

export default function SignInPage() {
  const router = useRouter();
  const { data: session } = useSession();

  if (session) {
    router.push('/private-cloud/products/all');
  }

  return (
    <div className="flex flex-col m-12">
      <h1 className="text-3xl font-semibold text-gray-900 mb-12 tracking-wider">
        Welcome to B.C. Government&apos;s Platform Product Registry
      </h1>

      <h1 className="text-3xl font-semibold text-gray-900 mb-12 tracking-wider">
        Private Cloud OpenShift Platform and Public Cloud AWS
      </h1>

      <h2 className="text-xl font-semibold text-gray-900 tracking-wider mb-4">Make changes to an existing product</h2>

      <p className="mb-4">
        For existing applications hosted on OpenShift 4 Platform or B.C. Government landing zone in AWS.
      </p>

      <p className="mb-4 max-w-7xl">
        You can update/change all product details and request product resource changes (including CPU/RAM/Storage.)
      </p>

      <LoginButton />

      <h2 className="text-xl font-semibold text-gray-900 tracking-wider mt-12 mb-4">Register a new product</h2>

      <p className="mb-4 max-w-7xl">
        If you are a Product Owner for a new cloud-native application and are interested in hosting the application
        please review the available options below:
      </p>
      <ul className="list-disc m-0 pl-8">
        <li className="mb-2">
          <a
            href="https://digital.gov.bc.ca/cloud/services/private/intro/"
            className="text-blue-500 hover:text-blue-700"
          >
            Private cloud hosting
          </a>
        </li>
        <li className="mb-2">
          <a
            href="https://digital.gov.bc.ca/cloud/services/public/intro/"
            className="text-blue-500 hover:text-blue-700"
          >
            Public cloud hosting
          </a>
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-gray-900 tracking-wider mt-8 mb-4">Before you start:</h2>

      <p className="mb-4 max-w-7xl">
        This self-serve online tool is for teams who have attended an onboarding session with the platform team.
      </p>

      <p className="mb-4 max-w-7xl">If you haven&apos;t attended an onboarding session, please contact:</p>
      <ul>
        <li>
          Private Cloud Platform Administrators{' '}
          <a href="mailto:PlatformServicesTeam@gov.bc.ca" className="text-blue-500 hover:text-blue-700">
            PlatformServicesTeam@gov.bc.ca
          </a>{' '}
          to book an{' '}
          <a
            href="https://digital.gov.bc.ca/cloud/services/private/onboard/"
            className="text-blue-500 hover:text-blue-700"
          >
            onboarding session for the (Openshift 4 Platform)
          </a>
        </li>
        <li>
          Public Cloud Platform Administrators{' '}
          <a href="mailto:Cloud.Pathfinder@gov.bc.ca" className="text-blue-500 hover:text-blue-700">
            Cloud.Pathfinder@gov.bc.ca
          </a>{' '}
          to book an{' '}
          <a
            href="https://digital.gov.bc.ca/cloud/services/public/onboard/"
            className="text-blue-500 hover:text-blue-700"
          >
            onboarding session for the (B.C. Government landing zone in AWS)
          </a>
        </li>
      </ul>

      <h2 className="text-xl font-semibold text-gray-900 tracking-wider mt-12 mb-4">What you will need</h2>
      <ul className="max-w-7xl space-y-1 text-gray-500 list-inside dark:text-gray-900">
        <li className="flex flex-row">
          <svg
            className="mt-1 w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-500 flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          Fulfill the onboarding prerequisites
        </li>
        <li className="flex flex-row">
          <svg
            className="mt-1 w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-500 flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          Have a valid IDIR account, which you&apos;ll use to access the registry
        </li>
        <li className="flex flex-row">
          <svg
            className="mt-1 w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-500 flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          Provide an application name and description without using acronyms
        </li>
        <li className="flex flex-row">
          <svg
            className="mt-1 w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-5 00 flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <span>Share contact details and IDIR information for the product owner and up to 2 technical leads</span>
        </li>
        <li className="flex flex-row">
          <svg
            className="mt-1 w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-5 00 flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <span>An idea of which common components you will use</span>
        </li>
        <li className="flex flex-row">
          <svg
            className="mt-1 w-3.5 h-3.5 mr-2 text-green-500 dark:text-green-5 00 flex-shrink-0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
          </svg>
          <span>
            Provide an estimate for your project&apos;s projected budget if using AWS <strong>(must be in USD)</strong>
          </span>
        </li>
      </ul>
      <br></br>
      <RegisterProductButton />
      <div className="bg-blue-50 mt-8 p-4 rounded-md flex">
        <div className="border-2 border-blue-700 relative w-1 h-1 bg-inherit rounded-full flex justify-center items-center text-center p-2 m-2 mr-4">
          <span className="font-bold text-blue-700 font-sans text-xs">i</span>
        </div>
        <div>
          <p className="text-sm text-blue-700 font-semibold mt-2">Note for Public Cloud:</p>
          <p className="text-sm text-blue-700 mt-1">
            The approval of a new project set creation request is subject to having a signed Memorandum of Understanding
            (MoU) with the Public Cloud Team. If you do not have a MoU in place, please email us at
            <span> </span>
            <a href="mailto:cloud.pathfinder@gov.bc.ca" className="underline">
              Cloud.Pathfinder@gov.bc.ca
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
