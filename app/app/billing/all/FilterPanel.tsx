import { Box, Button, LoadingOverlay } from '@mantine/core';
import { useSnapshot } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { BillingStatus } from '@/constants/billing';
import { pageState } from './state';

const billingTypeOptions = Object.entries(BillingStatus).map(([key, value]) => ({
  value: key,
  label: value,
}));

export default function FilterPanel({ isLoading = false }: { isLoading?: boolean }) {
  const pageSnapshot = useSnapshot(pageState);

  return (
    <Box pos={'relative'}>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'pink', type: 'bars' }}
      />
      <div className="grid grid-cols-1 gap-y-2 md:grid-cols-12 md:gap-x-3">
        <div className="col-span-6">
          <FormMultiSelect
            name="roles"
            label="Billing status"
            value={pageSnapshot.billings ?? []}
            data={billingTypeOptions}
            onChange={(value) => {
              pageState.billings = value;
              pageState.page = 1;
            }}
            classNames={{ wrapper: '' }}
          />
        </div>
      </div>
    </Box>
  );
}
