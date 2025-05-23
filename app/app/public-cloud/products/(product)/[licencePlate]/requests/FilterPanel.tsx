import { useSnapshot } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { DecisionStatus, RequestType } from '@/prisma/client';
import { pageState } from './state';

export default function FilterPanel() {
  const pageSnapshot = useSnapshot(pageState);

  return (
    <div className="grid grid-cols-1 gap-y-2 md:grid-cols-12 md:gap-x-3">
      <div className="col-span-6" />
      <FormMultiSelect
        name="type"
        label="Request Type"
        value={pageSnapshot.types ?? []}
        data={Object.values(RequestType)}
        onChange={(value) => {
          pageState.types = value as RequestType[];
          pageState.page = 1;
        }}
        classNames={{ wrapper: 'col-span-3' }}
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
        classNames={{ wrapper: 'col-span-3' }}
      />
    </div>
  );
}
