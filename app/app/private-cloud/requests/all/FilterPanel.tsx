import { Cluster, DecisionStatus, Ministry, Prisma, RequestType } from '@prisma/client';
import { useSnapshot } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { ministryOptions, clusters } from '@/constants';
import { pageState } from './state';

export default function FilterPanel() {
  const pageSnapshot = useSnapshot(pageState);

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
        classNames={{ wrapper: 'col-span-4' }}
      />
      <FormMultiSelect
        name="cluster"
        label="Cluster"
        value={pageSnapshot.clusters ?? []}
        data={[...clusters.map((v) => ({ label: v, value: v }))]}
        onChange={(value) => {
          pageState.clusters = value as Cluster[];
          pageState.page = 1;
        }}
        classNames={{ wrapper: 'col-span-2' }}
      />
      <FormMultiSelect
        name="type"
        label="Request Type"
        value={pageSnapshot.types ?? []}
        data={Object.values(RequestType)}
        onChange={(value) => {
          pageState.types = value as RequestType[];
          pageState.page = 1;
        }}
        classNames={{ wrapper: 'col-span-2' }}
      />
      <FormMultiSelect
        name="status"
        label="Status"
        value={pageSnapshot.status ?? []}
        data={Object.values(DecisionStatus)}
        onChange={(value) => {
          pageState.status = value as DecisionStatus[];
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
