import { useSnapshot } from 'valtio';
import FormDateRangePicker from '@/components/generic/select/FormDateRangePicker';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import FormUserPicker from '@/components/generic/select/FormUserPicker';
import { clusters, ministryOptions } from '@/constants';
import { Cluster, Ministry } from '@/prisma/client';
import { pageState } from './state';

export default function FilterPanel() {
  const pageSnapshot = useSnapshot(pageState);

  return (
    <div className="grid grid-cols-12 gap-4 w-full">
      <div className="col-span-10">
        <FormMultiSelect
          name="ministry"
          label="Ministry"
          value={pageSnapshot.ministries ?? []}
          data={ministryOptions}
          onChange={(value) => (pageState.ministries = value as Ministry[])}
        />
      </div>

      <div className="col-span-2">
        <FormMultiSelect
          name="temporary"
          label="Temporary"
          value={pageSnapshot.temporary ?? []}
          data={['YES', 'NO']}
          onChange={(value) => (pageState.temporary = value as ('YES' | 'NO')[])}
        />
      </div>

      <div className="col-span-6">
        <FormMultiSelect
          name="cluster"
          label="Cluster"
          value={pageSnapshot.clusters ?? []}
          data={clusters.map((v) => ({ label: v, value: v }))}
          onChange={(value) => (pageState.clusters = value as Cluster[])}
        />
      </div>

      <div className="col-span-3">
        <FormUserPicker label="User" onChange={(user) => (pageState.userId = user?.id ?? '')} />
      </div>

      <div className="col-span-3">
        <FormDateRangePicker
          value={(pageSnapshot.dates.map((d) => new Date(d)) as [Date | null, Date | null]) ?? [null, null]}
          label="Date Range"
          onChange={(dates) => {
            pageState.dates = dates.filter((v): v is Date => v !== null).map((v) => v.toISOString());
          }}
        />
      </div>
    </div>
  );
}
