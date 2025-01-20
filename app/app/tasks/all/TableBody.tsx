'use client';

import { Avatar, Badge, Group, Table, Text } from '@mantine/core';
import { TaskStatus } from '@prisma/client';
import { startCase } from 'lodash-es';
import { useForm } from 'react-hook-form';
import MinistryBadge from '@/components/badges/MinistryBadge';
import CopyableButton from '@/components/generic/button/CopyableButton';
import { ExtendedTask, statusColorMap, taskTypeNames } from '@/constants/task';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { formatDate } from '@/utils/js';

interface TableProps {
  data: ExtendedTask[];
}

export default function TableBody({ data }: TableProps) {
  const methods = useForm({
    values: {
      tasks: data,
    },
  });

  const [tasks] = methods.watch(['tasks']);

  const rows = tasks.length ? (
    tasks.map((task, index) => (
      <Table.Tr key={task.id ?? index}>
        <Table.Td>{taskTypeNames[task.type]}</Table.Td>
        <Table.Td>
          {task.data && Object.keys(task.data).length !== 0 && (
            <ul>
              {Object.entries(task.data).map(([key, value]) => (
                <li key={key}>
                  <Text c="dimmed" size="sm" className="font-semibold">
                    {key}:
                  </Text>
                  <CopyableButton trancatedLen={10}>
                    {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                  </CopyableButton>
                </li>
              ))}
            </ul>
          )}
        </Table.Td>
        <Table.Td>
          {task.status === TaskStatus.COMPLETED ? (
            <Badge color={'green'}>{task.status}</Badge>
          ) : (
            <Badge color={'blue'}>{task.status}</Badge>
          )}
        </Table.Td>
        <Table.Td className="italic">{formatDate(task.createdAt)}</Table.Td>
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
          {task.roles && Object.keys(task.roles).length !== 0 && (
            <ul>
              {Object.entries(task.roles).map(([key, value]) => (
                <li key={key}>
                  <Badge autoContrast={true} size="sm" color="gray">
                    {value.split('-')}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Table.Td>
        <Table.Td>
          {task.permissions && task.permissions.length !== 0 ? (
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
          ) : (
            <></>
          )}
        </Table.Td>
        <Table.Td>
          {task.userIds && Object.keys(task.userIds).length !== 0 && (
            <ul>
              {Object.entries(task.userIds).map(([key, value]) => (
                <li key={key}>
                  <CopyableButton trancatedLen={10}>{value}</CopyableButton>
                </li>
              ))}
            </ul>
          )}
        </Table.Td>
        <Table.Td>
          <Group gap="sm" className="cursor-pointer" onClick={async () => {}}>
            {task.user && (
              <>
                <Avatar src={getUserImageData(task.user?.image)} size={36} radius="xl" />
                <div>
                  <Text size="sm" className="font-semibold">
                    {task.user?.id && (
                      <div>
                        {formatFullName(task.user)}
                        <MinistryBadge className="ml-1" ministry={task.user?.ministry} />
                      </div>
                    )}
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
      <Table.Td colSpan={5} className="italic">
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
            <Table.Th>Data</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Created At</Table.Th>
            <Table.Th>Decision</Table.Th>
            <Table.Th>Assigned Roles</Table.Th>
            <Table.Th>Assigned Permissions</Table.Th>
            <Table.Th>Assigned User Ids</Table.Th>
            <Table.Th>Completed By</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
