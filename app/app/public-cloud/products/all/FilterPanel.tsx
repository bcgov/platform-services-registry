import { Provider, Prisma, Ministry, ProjectStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useSnapshot, subscribe } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { ministryOptions, getAllowedOptions } from '@/constants';
import { pageState } from './state';

export default function FilterPanel() {
  const pageSnapshot = useSnapshot(pageState);
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <div className="grid grid-cols-1 gap-y-2 md:grid-cols-12 md:gap-x-3">
      <FormMultiSelect
        name="ministry"
        label="Ministry"
        value={pageSnapshot.ministries ?? []}
        data={ministryOptions}
        onChange={(value) => {
          pageState.ministries = value as Ministry[];
          pageState.page = 1;
        }}
        classNames={{ wrapper: 'col-span-6' }}
      />
      <FormMultiSelect
        name="provider"
        label="Provider"
        value={pageSnapshot.providers ?? []}
        data={getAllowedOptions(session)}
        onChange={(value) => {
          pageState.providers = value as Provider[];
          pageState.page = 1;
        }}
        classNames={{ wrapper: 'col-span-3' }}
      />
      <FormMultiSelect
        name="status"
        label="Status"
        value={pageSnapshot.status ?? []}
        data={Object.values(ProjectStatus)}
        onChange={(value) => {
          pageState.status = value as ProjectStatus[];
          pageState.page = 1;
        }}
        classNames={{ wrapper: 'col-span-3' }}
      />
    </div>
  );
}
