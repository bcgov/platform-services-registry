'use client';

import { Divider, LoadingOverlay, Box, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import Table from '@/components/generic/table/Table';
import { createModal } from '@/core/modal';
import { deleteOrganization as _deleteOrganization } from '@/services/backend/organizations';
import { deleteIncompleteUsers } from '@/services/backend/user';
import TableBodyModal from './TableBodyModal';

export const openDeleteModal = createModal<{}, {}>({
  settings: {
    size: 'xlg',
    title: 'Delete Users without IDIR GUID',
    closeOnEscape: false,
    closeOnClickOutside: false,
  },
  Component: function ({ closeModal }) {
    const { data, isLoading } = useQuery({
      queryKey: ['users'],
      queryFn: () => deleteIncompleteUsers(),
    });

    return (
      <Box pos="relative">
        <LoadingOverlay
          loaderProps={{ size: 'lg' }}
          visible={false}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        <Text size="lg" fw={600}>
          Users without IDIR GUID: {data?.count}
        </Text>
        <Text size="lg" fw={600}>
          Deleted users without IDIR GUID: {data?.deleted}
        </Text>
        <Text size="lg" fw={600}>
          Archived users without IDIR GUID: {data?.archived_due_to_error}
        </Text>
        <Table title="Updated users without IDIR GUID" isLoading={isLoading}>
          <TableBodyModal users={data?.results || []} />
        </Table>
        <Divider my="md" />
      </Box>
    );
  },
  onClose: () => {},
});
