import { Button, LoadingOverlay, Box } from '@mantine/core';
import { TaskType } from '@prisma/client';
import { startCase } from 'lodash-es';
import { useSnapshot } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { taskTypeNames } from '@/constants/task';
import { pageState } from './state';

const taskTypeOptions = Object.entries(taskTypeNames).map(([key, value]) => ({
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
        <div className="col-span-12">
          <FormMultiSelect
            name="tasks"
            label="Task Types"
            value={pageSnapshot.types ?? []}
            data={taskTypeOptions}
            onChange={(value) => {
              pageState.types = value as TaskType[];
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
                pageState.types = taskTypeOptions.map((option) => option.value as TaskType);
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
