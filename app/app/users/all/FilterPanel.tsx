import { Button, LoadingOverlay, Box } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useSnapshot } from 'valtio';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { listKeycloakAuthRoles } from '@/services/backend/keycloak';
import { pageState } from './state';

export default function FilterPanel() {
  const pageSnapshot = useSnapshot(pageState);
  const { data: authRoles, isFetching: isAuthRolesFetching } = useQuery({
    queryKey: ['roles'],
    queryFn: () => listKeycloakAuthRoles(),
  });

  const authRoleNames = (authRoles || []).map((role) => role.name ?? '').sort();

  return (
    <Box pos="relative">
      <LoadingOverlay
        visible={!authRoles || isAuthRolesFetching}
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
            data={authRoleNames}
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
                pageState.roles = authRoleNames;
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
