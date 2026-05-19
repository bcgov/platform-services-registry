'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import EntityPageHeader from '@/components/system/EntityPageHeader';
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
    <div className="pt-5 max-w-3xl space-y-4">
      <EntityPageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Systems', href: '/systems' },
          { label: 'Create System' },
        ]}
        title="Create System"
        description="Define a new system container and add the metadata that helps group related resources."
      />
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
