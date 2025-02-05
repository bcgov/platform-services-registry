'use client';

import { Badge, Table, Text } from '@mantine/core';
import { TaskStatus } from '@prisma/client';
import { startCase } from 'lodash-es';
import { ReactNode } from 'react';
import KeyValueTable from '@/components/generic/KeyValueTable';
import UserProfile from '@/components/users/UserProfile';
import { taskTypeMap } from '@/constants/task';
import { SearchTask } from '@/types/task';
import { formatDate } from '@/utils/js';

interface TableProps {
  data: SearchTask[];
}

function Assignees({ task }: { task: SearchTask }) {
  const result: ReactNode[] = [];
  if (task.roles?.length > 0) {
    result.push(
      <>
        <Text c="dimmed" size="sm" className="font-semibold">
          Roles
        </Text>
        <ul className="mb-3">
          {task.roles.map((role, index) => (
            <li key={index}>
              <Badge autoContrast={true} size="sm" color="gray">
                {startCase(role)}
              </Badge>
            </li>
          ))}
        </ul>
      </>,
    );
  }

  if (task.permissions?.length > 0) {
    result.push(
      <>
        <Text c="dimmed" size="sm" className="font-semibold">
          Permissions
        </Text>
        <ul className="mb-3">
          {task.permissions.map((permission, index) => (
            <li key={index}>
              <Badge autoContrast={true} size="sm" color="gray">
                {startCase(permission)}
              </Badge>
            </li>
          ))}
        </ul>
      </>,
    );
  }

  if (task.users?.length > 0) {
    result.push(
      <>
        <Text c="dimmed" size="sm" className="font-semibold">
          Users
        </Text>
        {task.users.map((user) => (
          <UserProfile key={user.id} data={user} />
        ))}
      </>,
    );
  }

  result.push(
    <Text className="mt-2 italic" size="sm">
      At: {formatDate(task.createdAt)}
    </Text>,
  );

  return result;
}

export default function TableBody({ data }: TableProps) {
  const rows =
    data.length > 0 ? (
      data.map((task) => (
        <Table.Tr key={task.id}>
          <Table.Td>{taskTypeMap[task.type]}</Table.Td>
          <Table.Td>
            {task.status === TaskStatus.COMPLETED ? (
              <Badge color="green">{task.status}</Badge>
            ) : (
              <Badge color="blue">{task.status}</Badge>
            )}
          </Table.Td>
          <Table.Td>
            <Assignees task={task} />
          </Table.Td>
          <Table.Td>
            {task.completedByUser && (
              <UserProfile data={task.completedByUser}>
                <Text className="mt-2 italic" size="sm">
                  At: {formatDate(task.completedAt)}
                </Text>
              </UserProfile>
            )}
          </Table.Td>
          <Table.Td>
            <KeyValueTable data={task.data || {}} />
          </Table.Td>
          <Table.Td>
            <KeyValueTable data={task.closedMetadata || {}} />
          </Table.Td>
        </Table.Tr>
      ))
    ) : (
      <Table.Tr>
        <Table.Td colSpan={8} className="italic">
          No events found
        </Table.Td>
      </Table.Tr>
    );

  return (
    <Table.ScrollContainer minWidth={500}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Type</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Assigned</Table.Th>
            <Table.Th>Completed</Table.Th>
            <Table.Th>Data</Table.Th>
            <Table.Th>Metadata</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
