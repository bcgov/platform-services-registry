'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { processNumber } from '@/utils/js';

const validationSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  address: z.string().min(1).max(100),
  age: z.preprocess((v) => processNumber(v), z.number().min(20)),
  height: z.preprocess((v) => processNumber(v), z.number().min(100)),
});

const Page = createClientPage({
  roles: [GlobalRole.User],
});
export default Page(() => {
  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {},
  });

  return (
    <>
      <h1 className="font-bold text-2xl mt-4 mb-5">Text Input</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(console.log)} autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 md:py-2">
            <HookFormTextInput
              label="First name"
              name="firstName"
              placeholder="Enter first name..."
              required
              classNames={{ wrapper: 'col-span-1' }}
            />
            <HookFormTextInput
              label="Last name"
              name="lastName"
              placeholder="Enter last name..."
              required
              classNames={{ wrapper: 'col-span-1' }}
            />
            <HookFormTextInput
              label="Address"
              name="address"
              placeholder="Enter address..."
              classNames={{ wrapper: 'col-span-1' }}
            />
            <HookFormTextInput
              name="age"
              type="number"
              placeholder="Enter age..."
              classNames={{ wrapper: 'col-span-1' }}
            />
            <HookFormTextInput
              name="height"
              placeholder="Enter height..."
              disabled
              classNames={{ wrapper: 'col-span-1' }}
            />
          </div>

          <Button variant="success" type="submit" className="mt-1">
            Submit
          </Button>
        </form>
      </FormProvider>
    </>
  );
});
