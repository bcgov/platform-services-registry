'use client';

import { Avatar, Badge, Group, Table, Text } from '@mantine/core';
import { EventType } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { eventTypeNames } from '@/constants/event';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { formatDate } from '@/utils/js';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  image: string;
}

interface Event {
  id: string;
  type: EventType;
  userId: string | null;
  createdAt: string;
  user: User | null;
}

interface TableProps {
  data: Event[];
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
          <Text size="xs">{eventTypeNames[event.type]}</Text>
        </Table.Td>
        <Table.Td>
          <Group gap="sm" className="cursor-pointer" onClick={async () => {}}>
            <Avatar src={getUserImageData(event.user?.image)} size={36} radius="xl" />
            <div>
              <Text size="sm" className="font-semibold">
                {formatFullName(event.user)}
              </Text>
              <Text size="xs" opacity={0.5}>
                {event.user?.email}
              </Text>
            </div>
          </Group>
        </Table.Td>
        <Table.Td>
          {event.user?.jobTitle && (
            <div>
              <Badge color="info" variant="filled">
                {event.user?.jobTitle}
              </Badge>
            </div>
          )}
        </Table.Td>
        <Table.Td>
          <Text size="xs">{formatDate(event.createdAt)}</Text>
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
            <Table.Th>Event Type</Table.Th>
            <Table.Th>User</Table.Th>
            <Table.Th>Position</Table.Th>
            <Table.Th>Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
