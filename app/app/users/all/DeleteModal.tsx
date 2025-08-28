'use client';

import { Divider, LoadingOverlay, Box, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import SimpleTable from '@/components/generic/simple-table/SimpleTable';
import { createModal } from '@/core/modal';
import { deleteIncompleteUsers } from '@/services/backend/user';

export const openDeleteModal = createModal<{}, {}>({
  settings: {
    size: 'xlg',
    title: 'Delete Users without IDIR GUID',
    closeOnEscape: false,
    closeOnClickOutside: false,
  },
  Component: function ({ closeModal }) {
    const { data, isLoading } = useQuery({
      queryKey: ['users-missing-idirGuid:delete'],
      queryFn: () => deleteIncompleteUsers(),
    });

    const columns = [
      { label: 'Email', value: 'email' },
      {
        label: 'Outcome',
        value: 'outcome',
      },
      {
        label: 'Error',
        value: 'error',
      },
    ];

    const results = data?.results ?? [];

    return (
      <Box pos="relative">
        <LoadingOverlay
          loaderProps={{ size: 'lg' }}
          visible={isLoading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <Text size="lg" fw={600}>
          Users without IDIR GUID (processed): {data?.count ?? 0}
        </Text>
        <Text size="lg" fw={600}>
          Deleted: {data?.deleted ?? 0}
        </Text>
        <Text size="lg" fw={600}>
          Archived (error): {data?.archivedDueToError ?? 0}
        </Text>
        <Divider my="md" />
        <SimpleTable className="mt-2" columns={columns} data={results} />
        <Divider my="md" />
      </Box>
    );
  },
  onClose: () => {},
});
