"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LoginButton from "@/components/buttons/LoginButton";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col m-12">
      <h1 className="font-bcsans text-3xl font-semibold text-gray-900 mb-12 tracking-wider">
        Welcome to BC Gov&apos;s Product Registry
      </h1>

      <h1 className="font-bcsans text-3xl font-semibold text-gray-900 mb-12 tracking-wider">
        Private Cloud Openshift Platform &amp; BCGov&apos;s Landing Zone in AWS
      </h1>

      <h2 className="font-bcsans text-xl font-semibold text-gray-900 tracking-wider mb-4">
        Request a new project set or make changes to an existing product
      </h2>

      <p className="mb-4">
        You can request a new project set for hosting on Private Cloud Openshift
        Platform or BC Gov&apos;s Landing Zone in AWS after logging in below.
      </p>

      <p className="mb-4 max-w-7xl">
        For existing application&apos;s hosted on Private CLoud OpenShift Platform,
        you can update/change all product details and request product resource
        quota increases and downgrades \(including CPU/RAM/Storage\). For existing
        applications using BC Gov&apos;s Landing Zone in AWS, you can update/change
        product deetails and request estimated monthly spend and billing code
        changes
      </p>

      <LoginButton />

      <h2 className="font-bcsans text-xl font-semibold text-gray-900 tracking-wider mt-12 mb-4">
        What you will need to request a new project set
      </h2>
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
          A descriptive product name \(no acronyms\)
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
          Contact details and Github IDs for a product owner and up to 2
          technical leads
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
          For Private Cloud Openshift Platform- An idea of which common
          components you will use \(refer to common components list\)
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
            For BC Gov&apos;s Landing Zone in AWS - An estimate for the average
            monthly spend on cloud service usage for your new project \(Refer to
            the AWS Cost Calculator\) and a AWS Billing Code \(Refer to Billing
            Information\)
          </span>
        </li>
      </ul>

      <div className="bg-blue-50 mt-8 p-4 rounded-md flex">
        <div className="border-2 border-blue-700 relative w-1 h-1 bg-inherit rounded-full flex justify-center items-center text-center p-2 m-2 mr-4">
          <span className="font-bold text-blue-700 font-sans text-xs">i</span>
        </div>
        <div>
          <p className="font-bcsans text-sm text-blue-700 font-semibold mt-2">
            Note:
          </p>
          <p className="font-bcsans text-sm text-blue-700 mt-1">
            The approval of new project set creation request is subject to
            having a signed Memorandum of Understanding \(MoU\) with the Public
            Cloud Team. If you do not have a MoU in place, please email us at
            <span> </span>
            <a href="mailto:cloud.pathfinder@gov.bc.ca" className="underline">
              cloud.pathfinder@gov.bc.ca
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
