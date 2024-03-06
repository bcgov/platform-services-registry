import AsyncAutocomplete from '@/components/form/AsyncAutocomplete';
import React from 'react';
// import { useSession } from 'next-auth/react';
// import {  useForm } from 'react-hook-form';
// import { PublicCloudCreateRequestBodySchema, UserInputSchema } from '@/schema';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';

export default function ExpenseAuthority({ disabled }: { disabled?: boolean }) {
  //   const { data: session, status } = useSession({
  //     required: true,
  //   });
  // console.log("session?.previews.expenseAuthority", session?.previews.expenseAuthority)
  //   if (session?.previews.expenseAuthority) {

  // useForm({
  //   resolver: zodResolver(
  //     PublicCloudCreateRequestBodySchema.merge(
  //       z.object({
  //         expenseAuthority: UserInputSchema.optional().nullable(),
  //       })
  //     ),
  //   ),

  // });
  // return null;
  //   }

  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        3. Expense Authority
      </h2>
      <div className="mt-6 2xl:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-8 lg:gap-x-24 gap-y-8">
        <div className="flex flex-col justify-between">
          <div>
            <h3 className="font-bcsans text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
              Expense Authority (EA)
            </h3>
            <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
              Tell us about the Expense Authority (EA). This is typically refers to the permission granted to an
              individual to incur expenses on behalf of the organization within specified limits and guidelines. Please
              use only IDIR linked email address below.
            </p>
          </div>
          <AsyncAutocomplete
            disabled={disabled}
            name="expenseAuthority"
            className="mt-8"
            label="Expense Authority Email"
            placeHolder="Search expense authority's IDIR email address"
          />
        </div>
      </div>
    </div>
  );
}
