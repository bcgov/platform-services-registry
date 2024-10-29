'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconInfoCircle, IconUsersGroup, IconComponents } from '@tabler/icons-react';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import PreviousButton from '@/components/buttons/Previous';
import CommonComponents from '@/components/form/CommonComponents';
import ProjectDescription from '@/components/form/ProjectDescriptionPrivate';
import TeamContacts from '@/components/form/TeamContacts';
import PageAccordion from '@/components/generic/accordion/PageAccordion';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import { openPrivateCloudProductCreateSubmitModal } from '@/components/modal/privateCloudProductCreateSubmit';
import { AGMinistries, GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { privateCloudCreateRequestBodySchema } from '@/validation-schemas/private-cloud';

const privateCloudProductNew = createClientPage({
  roles: [GlobalRole.User],
});

export default privateCloudProductNew(({ session }) => {
  const [secondTechLead, setSecondTechLead] = useState(false);

  const methods = useForm({
    resolver: zodResolver(
      privateCloudCreateRequestBodySchema
        .merge(
          z.object({
            isAgMinistryChecked: z.boolean().optional(),
          }),
        )
        .refine(
          (formData) => {
            return AGMinistries.includes(formData.ministry) ? formData.isAgMinistryChecked : true;
          },
          {
            message: 'AG Ministry Checkbox should be checked.',
            path: ['isAgMinistryChecked'],
          },
        ),
    ),
    defaultValues: { secondaryTechnicalLead: null },
  });

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister('secondaryTechnicalLead');
    }
  };

  const accordionItems = [
    {
      LeftIcon: IconInfoCircle,
      label: 'Product description',
      description: '',
      Component: ProjectDescription,
      componentArgs: { mode: 'create' },
    },
    {
      LeftIcon: IconUsersGroup,
      label: 'Team contacts',
      description: '',
      Component: TeamContacts,
      componentArgs: { secondTechLead, secondTechLeadOnClick },
    },
    {
      LeftIcon: IconComponents,
      label: 'Common components',
      description: '',
      Component: CommonComponents,
      componentArgs: {},
    },
  ];

  return (
    <div>
      <h1 className="flex justify-between text-xl lg:text-2xl xl:text-4xl font-semibold leading-7 text-gray-900 mt-2 mb-0 lg:mt-4">
        New Private Cloud Product
      </h1>
      <h3 className="mt-0 mb-3 italic">Private Cloud OpenShift platform</h3>

      <FormProvider {...methods}>
        <FormErrorNotification />
        <form
          onSubmit={methods.handleSubmit(async (formData) => {
            await openPrivateCloudProductCreateSubmitModal({ productData: formData });
          })}
          autoComplete="off"
        >
          <PageAccordion items={accordionItems} />

          <div className="mt-5 flex items-center justify-start gap-x-6">
            <PreviousButton />
            <button
              type="submit"
              className="flex mr-20 rounded-md bg-bcorange px-4 py-2.5 text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              SUBMIT REQUEST
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
});
