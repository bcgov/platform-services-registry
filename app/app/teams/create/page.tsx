'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import EntityPageHeader from '@/components/system/EntityPageHeader';
import TeamForm from '@/components/system/TeamForm';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { createTeam } from '@/services/backend/teams';
import { TeamBody } from '@/validation-schemas/team';

const Page = createClientPage({
  permissions: [GlobalPermissions.ManageTeams],
  fallbackUrl: '/teams',
});

export default Page(() => {
  const router = useRouter();
  const { mutateAsync } = useMutation({
    mutationFn: (value: TeamBody) => createTeam(value),
  });

  return (
    <div className="pt-5 max-w-3xl space-y-4">
      <EntityPageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Teams', href: '/teams' },
          { label: 'Create Team' },
        ]}
        title="Create Team"
        description="Set up a new team and capture the people and roles that support one or more systems."
      />
      <TeamForm
        onSubmit={async (value) => {
          const created = await mutateAsync(value);
          router.push(`/teams/${created?.id}`);
        }}
        submitLabel="Create Team"
      />
    </div>
  );
});
