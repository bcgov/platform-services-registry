'use client';

import { Badge, Table, Text } from '@mantine/core';
import KeyValueTable from '@/components/generic/KeyValueTable';
import UserProfile from '@/components/users/UserProfile';
import { eventTypeNames, ExtendedEvent } from '@/constants/event';
import { formatDate } from '@/utils/js';

interface TableProps {
  data: ExtendedEvent[];
}

export default function TableBody({ data }: TableProps) {
  const rows = data.length ? (
    data.map((event, index) => (
      <Table.Tr key={event.id ?? index}>
        <Table.Td>
          <Text size="md">{eventTypeNames[event.type]}</Text>
        </Table.Td>
        <Table.Td>
          <Table.Td>
            {event.user && (
              <UserProfile data={event.user}>
                <Badge color="info" variant="filled">
                  {event.user.jobTitle}
                </Badge>
              </UserProfile>
            )}
          </Table.Td>
        </Table.Td>
        <Table.Td>
          <Text size="xs">{formatDate(event.createdAt)}</Text>
        </Table.Td>
        <Table.Td>
          <KeyValueTable data={event.data || {}} />
        </Table.Td>
      </Table.Tr>
    ))
  ) : (
    <Table.Tr>
      <Table.Td colSpan={5} className="italic">
        No events found
      </Table.Td>
    </Table.Tr>
  );

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Type</Table.Th>
            <Table.Th>User</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Data</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
