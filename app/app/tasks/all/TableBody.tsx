'use client';

import { Avatar, Badge, Code, Group, Table, Text } from '@mantine/core';
import { TaskStatus } from '@prisma/client';
import { useQueries } from '@tanstack/react-query';
import { startCase } from 'lodash-es';
import { useForm } from 'react-hook-form';
import MinistryBadge from '@/components/badges/MinistryBadge';
import { ExtendedTask, statusColorMap, taskTypeNames } from '@/constants/task';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { getUserInfo } from '@/services/backend/user';
import { formatDate } from '@/utils/js';

interface TableProps {
  data: ExtendedTask[];
}

interface UserInfo {
  id: string;
  image: string;
  ministry: string;
  email: string;
}

export default function TableBody({ data }: TableProps) {
  const methods = useForm({
    values: {
      tasks: data,
    },
  });

  const [tasks] = methods.watch(['tasks']);

  const userIds = Array.from(
    new Set(tasks.flatMap((task) => (task.userIds ? Object.values(task.userIds) : [])).filter((userId) => userId)),
  );

  const userQueries = useQueries({
    queries: userIds.map((userId) => ({
      queryKey: ['user', userId],
      queryFn: () => getUserInfo(userId),
    })),
  });

  const userInfoMap = userQueries.reduce(
    (acc, query, index) => {
      if (query.data) {
        acc[userIds[index]] = query.data;
      }
      return acc;
    },
    {} as { [key: string]: UserInfo },
  );

  const rows = tasks.length ? (
    tasks.map((task, index) => (
      <Table.Tr key={task.id ?? index}>
        <Table.Td>{taskTypeNames[task.type]}</Table.Td>
        <Table.Td>
          {task.status === TaskStatus.COMPLETED ? (
            <Badge color="green">{task.status}</Badge>
          ) : (
            <Badge color="blue">{task.status}</Badge>
          )}
        </Table.Td>
        <Table.Td>
          {task.closedMetadata && Object.keys(task.closedMetadata).length !== 0 && (
            <ul>
              {Object.entries(task.closedMetadata).map(([key, value]) => (
                <li key={key}>
                  <Badge color={statusColorMap[value] || 'teal'}>
                    {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Table.Td>
        <Table.Td>
          {task.roles && task.roles?.length !== 0 && (
            <>
              <Text c="dimmed" size="sm" className="font-semibold">
                Roles:
              </Text>
              <ul className="mb-3">
                {task.roles.map((role, key) => (
                  <li key={key}>
                    <Badge autoContrast={true} size="sm" color="gray">
                      {startCase(role)}
                    </Badge>
                  </li>
                ))}
              </ul>
            </>
          )}

          {task.permissions && task.permissions?.length !== 0 && (
            <>
              <Text c="dimmed" size="sm" className="font-semibold">
                Permissions:
              </Text>
              <ul>
                {task.permissions.map((permission, key) => (
                  <li key={key}>
                    <Text size="sm">
                      <Badge autoContrast={true} size="sm" color="gray">
                        {startCase(permission)}
                      </Badge>
                    </Text>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Table.Td>
        <Table.Td>
          {task.userIds && Object.keys(task.userIds).length !== 0 && (
            <ul>
              {Object.entries(task.userIds).map(([key, value]) => {
                const userInfo = userInfoMap[value];
                return (
                  <li className="my-5" key={key}>
                    <Avatar src={getUserImageData(userInfo?.image)} size={36} radius="xl" />
                    <div>
                      <Text size="sm" className="font-semibold">
                        <div>
                          {formatFullName(userInfo)}
                          <MinistryBadge className="ml-1" ministry={userInfo?.ministry} />
                        </div>
                      </Text>
                      <Text size="xs" opacity={0.5}>
                        {userInfo?.email}
                      </Text>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Table.Td>
        <Table.Td>
          <Code block>{JSON.stringify(task.data, null, 2)}</Code>
        </Table.Td>
        <Table.Td className="italic">{formatDate(task.createdAt)}</Table.Td>
        <Table.Td>
          <Group gap="sm" className="cursor-pointer" onClick={async () => {}}>
            {task.user && (
              <>
                <Avatar src={getUserImageData(task.user?.image)} size={36} radius="xl" />
                <div>
                  <Text size="sm" className="font-semibold">
                    <div>
                      {formatFullName(task.user)}
                      <MinistryBadge className="ml-1" ministry={task.user?.ministry} />
                    </div>
                  </Text>
                  <Text size="xs" opacity={0.5}>
                    {task.user?.email}
                  </Text>
                  <Text className="mt-2 italic" size="sm">
                    At: {formatDate(task.completedAt)}
                  </Text>
                </div>
              </>
            )}
          </Group>
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
            <Table.Th>Decision</Table.Th>
            <Table.Th>Assigned Roles/Permissions</Table.Th>
            <Table.Th>Assigned User</Table.Th>
            <Table.Th>Data</Table.Th>
            <Table.Th>Created At</Table.Th>
            <Table.Th>Completed By</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
