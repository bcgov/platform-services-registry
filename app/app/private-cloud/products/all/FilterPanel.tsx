import { useSnapshot } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { clusters } from '@/constants';
import { Cluster, ProjectStatus } from '@/prisma/client';
import { appState } from '@/states/global';
import { pageState } from './state';

export default function FilterPanel() {
  const appSnapshot = useSnapshot(appState);
  const pageSnapshot = useSnapshot(pageState);

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
        name="cluster"
        label="Cluster"
        value={pageSnapshot.clusters ?? []}
        data={[
          ...clusters.map((v) => (v === Cluster.GOLDDR ? { label: 'GOLD (DR)', value: v } : { label: v, value: v })),
        ]}
        onChange={(value) => {
          pageState.clusters = value as Cluster[];
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
      <FormMultiSelect
        name="temporary"
        label="Temporary"
        value={pageSnapshot.temporary ?? []}
        data={['YES', 'NO']}
        onChange={(value) => {
          pageState.temporary = value as ('YES' | 'NO')[];
          pageState.page = 1;
        }}
        classNames={{ wrapper: 'col-span-2' }}
      />
    </div>
  );
}
