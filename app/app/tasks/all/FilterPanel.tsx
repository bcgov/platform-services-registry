import { Button, LoadingOverlay, Box } from '@mantine/core';
import { useSnapshot } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { taskTypeMap } from '@/constants';
import { TaskStatus, TaskType } from '@/prisma/types';
import { pageState } from './state';

const taskTypeOptions = Object.entries(taskTypeMap).map(([key, value]) => ({
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
        <div className="col-span-6">
          <FormMultiSelect
            name="types"
            label="Types"
            value={pageSnapshot.types ?? []}
            data={taskTypeOptions}
            onChange={(value) => {
              pageState.types = value as TaskType[];
              pageState.page = 1;
            }}
            classNames={{ wrapper: '' }}
          />
        </div>
        <div className="col-span-6">
          <FormMultiSelect
            name="statuses"
            label="Statuses"
            value={pageSnapshot.statuses ?? []}
            data={Object.values(TaskStatus)}
            onChange={(value) => {
              pageState.statuses = value as TaskStatus[];
              pageState.page = 1;
            }}
            classNames={{ wrapper: '' }}
          />
        </div>
      </div>
    </Box>
  );
}
