import { useSnapshot } from 'valtio';
import LoadingBox from '@/components/generic/LoadingBox';
import FormSingleSelect from '@/components/generic/select/FormSingleSelect';
import { pageState } from './state';

export default function FilterPanel({ isLoading = false }: { isLoading?: boolean }) {
  const pageSnapshot = useSnapshot(pageState);

  let status = 'all';
  if (pageSnapshot.approved) {
    status = 'approved';
  } else if (pageSnapshot.signed) {
    status = 'signed';
  } else if (pageSnapshot.approved === false && pageSnapshot.signed === false) {
    status = 'assigned';
  }

  return (
    <LoadingBox isLoading={isLoading}>
      <div className="grid grid-cols-1 gap-y-2 md:grid-cols-12 md:gap-x-3">
        <div className="col-span-6">
          <FormSingleSelect
            name="status"
            value={status}
            data={[
              { label: 'All', value: 'all' },
              { label: 'Assigned', value: 'assigned' },
              { label: 'Signed', value: 'signed' },
              { label: 'Approved', value: 'approved' },
            ]}
            onChange={(value) => {
              if (!value) return;

              if (value === 'assigned') {
                pageState.signed = false;
                pageState.approved = false;
              } else if (value === 'signed') {
                pageState.signed = true;
                pageState.approved = false;
              } else if (value === 'approved') {
                pageState.signed = true;
                pageState.approved = true;
              } else {
                pageState.signed = undefined;
                pageState.approved = undefined;
              }
            }}
          />
        </div>
      </div>
    </LoadingBox>
  );
}
