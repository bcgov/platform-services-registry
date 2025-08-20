import { useSession } from 'next-auth/react';
import { useSnapshot } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { getAllowedOptions, productBillingStatusOptions } from '@/constants';
import { Provider, ProjectStatus } from '@/prisma/client';
import { appState } from '@/states/global';
import { ProductBiliingStatus } from '@/types';
import { pageState } from './state';

export default function FilterPanel() {
  const appSnapshot = useSnapshot(appState);
  const pageSnapshot = useSnapshot(pageState);
  const { data: session } = useSession();
  if (!session) return null;

  return (
    <div className="grid grid-cols-1 gap-y-2 md:grid-cols-12 md:gap-x-3">
      <FormMultiSelect
        name="ministry"
        label="Ministry"
        value={pageSnapshot.ministries ?? []}
        data={appSnapshot.info.ORGANIZATION_SEARCH_OPTIONS}
        onChange={(value) => {
          pageState.ministries = value as string[];
          pageState.page = 1;
        }}
        classNames={{ wrapper: 'col-span-5' }}
      />
      <FormMultiSelect
        name="provider"
        label="Provider"
        value={pageSnapshot.providers ?? []}
        data={getAllowedOptions()}
        onChange={(value) => {
          pageState.providers = value as Provider[];
          pageState.page = 1;
        }}
        classNames={{ wrapper: 'col-span-2' }}
      />
      <FormMultiSelect
        name="billingStatus"
        label="Billing Status"
        value={pageSnapshot.billingStatus ?? []}
        data={productBillingStatusOptions}
        onChange={(value) => {
          pageState.billingStatus = value as ProductBiliingStatus[];
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
        classNames={{ wrapper: 'col-span-2' }}
      />
    </div>
  );
}
