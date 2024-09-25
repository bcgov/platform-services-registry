'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import HookFormMultiSelect from '@/components/generic/select/HookFormMultiSelect';
import createClientPage from '@/core/client-page';

const validationSchema = z.object({
  fruits: z.array(z.string()).min(1),
});

const Page = createClientPage({
  roles: ['user'],
});
export default Page(() => {
  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      fruits: [],
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(console.log)} autoComplete="off">
        <HookFormMultiSelect name="fruits" data={['apple', 'banana', 'avocado', 'grape', 'orange', 'raspberry']} />
        <Button variant="success" type="submit" className="mt-1">
          Submit
        </Button>
      </form>
    </FormProvider>
  );
});
