'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import HookFormTextarea from '@/components/generic/input/HookFormTextarea';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

const validationSchema = z.object({
  name: z.string().min(1).max(100),
  sentence: z.string().min(1).max(100),
  address: z.string().optional(),
});

const Page = createClientPage({
  roles: [GlobalRole.User],
});
export default Page(() => {
  const methods = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      sentence:
        'On a bright and sunny afternoon, the children gathered in the park, their laughter echoing through the air as they played games, chased butterflies, and shared stories under the shade of the old oak tree, creating memories that would last a lifetime.',
    },
  });

  return (
    <>
      <h1 className="font-bold text-2xl mt-4 mb-5">Textarea</h1>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(console.log)} autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 md:py-2">
            <HookFormTextarea
              label="Name"
              name="name"
              placeholder="Enter name..."
              required
              classNames={{ wrapper: 'col-span-1' }}
            />
            <HookFormTextarea
              label="Sentence"
              name="sentence"
              placeholder="Enter sentence..."
              required
              disabled
              copyable
              classNames={{ wrapper: 'col-span-1' }}
            />
            <HookFormTextarea
              name="address"
              placeholder="Enter address..."
              copyable
              classNames={{ wrapper: 'col-span-1' }}
              rows={10}
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
