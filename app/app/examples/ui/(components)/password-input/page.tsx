'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import HookFormPasswordInput from '@/components/generic/input/HookFormPasswordInput';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

const validationSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
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
      <h1 className="font-bold text-2xl mt-4 mb-5">Password Input</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(console.log)} autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 md:py-2">
            <HookFormPasswordInput
              label="Username"
              name="username"
              placeholder="Enter username..."
              required
              classNames={{ wrapper: 'col-span-1' }}
            />
            <HookFormPasswordInput
              label="Password"
              name="password"
              placeholder="Enter password..."
              required
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
