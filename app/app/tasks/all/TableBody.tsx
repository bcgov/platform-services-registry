'use client';

import { Button, Badge, Table, Text } from '@mantine/core';
import { useQuery, useMutation } from '@tanstack/react-query';
import { startCase } from 'lodash-es';
import { Fragment, ReactNode } from 'react';
import KeyValueTable from '@/components/generic/KeyValueTable';
import UserProfile from '@/components/users/UserProfile';
import { taskTypeMap } from '@/constants/task';
import { TaskStatus } from '@/prisma/types';
import { sendTaskEmail } from '@/services/backend/tasks';
import { SearchTask } from '@/types/task';
import { formatDate } from '@/utils/js';

interface TableProps {
  data: SearchTask[];
}

function Assignees({ task }: { task: SearchTask }) {
  const result: ReactNode[] = [];
  if (task.roles?.length > 0) {
    result.push(
      <Fragment key="roles">
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
      </Fragment>,
    );
  }

  if (task.permissions?.length > 0) {
    result.push(
      <Fragment key="permissions">
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
      </Fragment>,
    );
  }

  if (task.users?.length > 0) {
    console.log('task.users', task.userIds, task.users);
    result.push(
      <Fragment key="users">
        <Text c="dimmed" size="sm" className="font-semibold">
          Users
        </Text>
        {task.users.map((user) => (
          <UserProfile key={user.id} data={user} />
        ))}
      </Fragment>,
    );
  }

  result.push(
    <Text className="mt-2 italic" size="sm" key="at">
      At: {formatDate(task.createdAt)}
    </Text>,
  );

  return result;
}

export default function TableBody({ data }: TableProps) {
  const { mutateAsync: _sendTaskEmail, isPending: isSendingTaskEmail } = useMutation({
    mutationFn: sendTaskEmail,
  });

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
          <Table.Td>
            {task.status === TaskStatus.ASSIGNED && (
              <Button
                size="xs"
                loading={isSendingTaskEmail}
                onClick={async () => {
                  if (isSendingTaskEmail) return;
                  await _sendTaskEmail(task.id);
                }}
              >
                Resend
              </Button>
            )}
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
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
