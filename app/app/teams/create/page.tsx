'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
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
    <div className="pt-5 max-w-3xl">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 mb-4">Create Team</h1>
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
