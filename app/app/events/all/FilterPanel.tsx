import { Box, Button, LoadingOverlay } from '@mantine/core';
import { EventType, User } from '@prisma/client';
import { useSnapshot } from 'valtio';
import FormDateRangePicker from '@/components/generic/select/FormDateRangePicker';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import FormUserPicker from '@/components/generic/select/FormUserPicker';
import { eventTypeNames } from '@/constants/event';
import { pageState } from './state';

const eventTypeOptions = Object.entries(eventTypeNames).map(([key, value]) => ({
  value: key,
  label: value,
}));

export default function FilterPanel({ isLoading = false }: { isLoading?: boolean }) {
  const pageSnapshot = useSnapshot(pageState);

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'pink', type: 'bars' }}
      />
      <div className="grid grid-cols-1 gap-y-2 md:grid-cols-12 md:gap-x-3">
        <FormMultiSelect
          name="roles"
          label="Types"
          value={pageSnapshot.types ?? []}
          data={eventTypeOptions}
          onChange={(value) => {
            pageState.types = value as EventType[];
            pageState.page = 1;
          }}
          classNames={{ wrapper: 'col-span-6' }}
        />
        <FormDateRangePicker
          label="Date Range"
          onChange={(dates) => {
            pageState.dates = dates.filter((value) => !!value).map((v) => v.toISOString());
            pageState.page = 1;
          }}
          classNames={{ wrapper: 'col-span-4' }}
        />
        <FormUserPicker
          label="User"
          onChange={(user) => {
            pageState.userId = user?.id ?? '';
            pageState.page = 1;
          }}
          classNames={{ wrapper: 'col-span-2' }}
        />
      </div>
    </Box>
  );
}
