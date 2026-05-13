'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import SystemForm from '@/components/system/SystemForm';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { createSystem } from '@/services/backend/systems';
import { SystemBody } from '@/validation-schemas/system';

const Page = createClientPage({
  permissions: [GlobalPermissions.ManageSystems],
  fallbackUrl: '/systems',
});

export default Page(() => {
  const router = useRouter();
  const { mutateAsync } = useMutation({
    mutationFn: (value: SystemBody) => createSystem(value),
  });

  return (
    <div className="pt-5 max-w-3xl">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 mb-4">Create System</h1>
      <SystemForm
        onSubmit={async (value) => {
          const created = await mutateAsync(value);
          router.push(`/systems/${created.id}`);
        }}
        submitLabel="Create System"
      />
    </div>
  );
});
