import { Button, LoadingOverlay, Box } from '@mantine/core';
import { useSnapshot } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { pageState } from './state';

export default function FilterPanel({
  isLoading = false,
  availableRoles = [],
}: {
  isLoading?: boolean;
  availableRoles?: string[];
}) {
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
            name="roles"
            label="Global Roles"
            value={pageSnapshot.roles ?? []}
            data={availableRoles}
            onChange={(value) => {
              pageState.roles = value;
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
                pageState.roles = availableRoles;
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
