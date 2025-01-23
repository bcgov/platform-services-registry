'use client';

import { Avatar, Badge, Code, Group, Table, Text } from '@mantine/core';
import { TaskStatus } from '@prisma/client';
import { startCase } from 'lodash-es';
import { useForm } from 'react-hook-form';
import MinistryBadge from '@/components/badges/MinistryBadge';
import { ExtendedTask, statusColorMap, taskTypeNames, UserInfo } from '@/constants/task';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { formatDate } from '@/utils/js';

interface TableProps {
  data: ExtendedTask[];
  assignees: UserInfo[];
}

export default function TableBody({ data, assignees }: TableProps) {
  const methods = useForm({
    values: {
      tasks: data,
      taskAssignees: assignees,
    },
  });

  const [tasks, taskAssignees] = methods.watch(['tasks', 'taskAssignees']);

  const rows =
    tasks.length && taskAssignees ? (
      tasks.map((task) => (
        <Table.Tr key={task.id}>
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
                  {task.roles.map((role, index) => (
                    <li key={index}>
                      <Badge autoContrast={true} size="sm" color="gray">
                        {startCase(role)}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {task.permissions?.length > 0 && (
              <>
                <Text c="dimmed" size="sm" className="font-semibold">
                  Permissions:
                </Text>
                <ul>
                  {task.permissions.map((permission, index) => (
                    <li key={index}>
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
            {task.userIds.length > 0 && (
              <ul>
                {task.userIds.map((id, index) => {
                  const userInfo = taskAssignees[index];
                  if (!userInfo) return null;
                  return (
                    <li className="my-5" key={index}>
                      <Avatar src={getUserImageData(userInfo.image)} size={36} radius="xl" />
                      <div>
                        <Text size="sm" className="font-semibold">
                          <div>
                            {formatFullName(userInfo)}
                            <MinistryBadge className="ml-1" ministry={userInfo.ministry} />
                          </div>
                        </Text>
                        <Text size="xs" opacity={0.5}>
                          {userInfo.email}
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
              {task.completedByUser && (
                <>
                  <Avatar src={getUserImageData(task.completedByUser.image)} size={36} radius="xl" />
                  <div>
                    <Text size="sm" className="font-semibold">
                      <div>
                        {formatFullName(task.completedByUser)}
                        <MinistryBadge className="ml-1" ministry={task.completedByUser.ministry} />
                      </div>
                    </Text>
                    <Text size="xs" opacity={0.5}>
                      {task.completedByUser.email}
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
            <Table.Th>Assigned User(s)</Table.Th>
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
