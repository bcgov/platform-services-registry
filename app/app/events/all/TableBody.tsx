'use client';

import { Avatar, Badge, Group, Table, Text, Code } from '@mantine/core';
import { useForm } from 'react-hook-form';
import MinistryBadge from '@/components/badges/MinistryBadge';
import { eventTypeNames, ExtendedEvent } from '@/constants/event';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { formatDate } from '@/utils/js';

interface TableProps {
  data: ExtendedEvent[];
}

export default function TableBody({ data }: TableProps) {
  const methods = useForm({
    values: {
      events: data,
    },
  });

  const [events] = methods.watch(['events']);

  const rows = events.length ? (
    events.map((event, index) => (
      <Table.Tr key={event.id ?? index}>
        <Table.Td>
          <Text size="md">{eventTypeNames[event.type]}</Text>
        </Table.Td>
        <Table.Td>
          <Group gap="sm" className="cursor-pointer" onClick={async () => {}}>
            <Avatar src={getUserImageData(event.user?.image)} size={36} radius="xl" />
            <div>
              <Text size="sm" className="font-semibold">
                {formatFullName(event.user)}
                <MinistryBadge className="ml-1" ministry={event.user?.ministry} />
              </Text>
              <Text size="xs" opacity={0.5}>
                {event.user?.email}
              </Text>
              {event.user?.jobTitle && (
                <div>
                  <Badge color="info" variant="filled">
                    {event.user?.jobTitle}
                  </Badge>
                </div>
              )}
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="xs">{formatDate(event.createdAt)}</Text>
        </Table.Td>
        <Table.Td>
          <Code block>{JSON.stringify(event.data, null, 2)}</Code>
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
