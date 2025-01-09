import { Box, Button, LoadingOverlay } from '@mantine/core';
import { EventType } from '@prisma/client';
import { useSnapshot } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { eventTypeNames } from '@/constants/event';
import { pageState } from './state';

const eventTypeOptions = Object.entries(eventTypeNames).map(([key, value]) => ({
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
        <div className="col-span-12">
          <FormMultiSelect
            name="roles"
            label="Event types"
            value={pageSnapshot.events ?? []}
            data={eventTypeOptions}
            onChange={(value) => {
              pageState.events = value as EventType[];
              pageState.page = 1;
            }}
            classNames={{ wrapper: '' }}
          />
          <div className="text-right">
            <Button
              color="primary"
              size="compact-md"
              className="mt-1"
              onClick={() => {
                pageState.events = eventTypeOptions.map((option) => option.value as EventType);
                pageState.page = 1;
              }}
            >
              Select All
            </Button>
          </div>
        </div>
      </div>
    </Box>
  );
}
