'use client';

import { Avatar, Badge, Table, Group, Text, UnstyledButton, Pill } from '@mantine/core';
import _get from 'lodash-es/get';
import _truncate from 'lodash-es/truncate';
import React from 'react';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { AdminViewUsers } from '@/types/user';
import { formatDate } from '@/utils/date';

interface TableProps {
  data: AdminViewUsers[];
  isLoading: boolean;
}

export default function TableBodyUsers({ data, isLoading = false }: TableProps) {
  if (isLoading) {
    return null;
  }

  const rows = data.length ? (
    data.map((item, index) => (
      <Table.Tr key={item.id ?? index}>
        <Table.Td>
          <Group gap="sm" className="cursor-pointer" onClick={async () => {}}>
            <Avatar src={getUserImageData(item.image)} size={36} radius="xl" />
            <div>
              <Text size="sm" className="font-semibold">
                {item.id ? (
                  <div>
                    {formatFullName(item)}
                    {item.ministry && (
                      <Badge color="dark" variant="light" className="ml-1">
                        {item.ministry}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <UnstyledButton className="text-gray-700 hover:underline">Click to select member</UnstyledButton>
                )}
              </Text>
              <Text size="xs" opacity={0.5}>
                {item.email}
              </Text>
            </div>
          </Group>
        </Table.Td>

        <Table.Td>
          {item.jobTitle && (
            <div>
              <Badge color="info" variant="light">
                {item.jobTitle}
              </Badge>
            </div>
          )}
          {item.officeLocation && (
            <div>
              <Badge color="primary" variant="light">
                {item.officeLocation}
              </Badge>
            </div>
          )}
        </Table.Td>

        <Table.Td>
          {item.id && (
            <Pill.Group>
              {item.roles.map((role) => (
                <Pill key={role}>{role}</Pill>
              ))}
            </Pill.Group>
          )}
        </Table.Td>
        <Table.Td>
          <Badge color="primary" variant="outline">
            {item.privateProducts.length}
          </Badge>
          <span className="mx-2">/</span>
          <Badge color="success" variant="outline">
            {item.publicProducts.length}
          </Badge>
        </Table.Td>
        <Table.Td className="italic">{formatDate(item.lastSeen) || <span>has not yet logged in</span>}</Table.Td>
        <Table.Td></Table.Td>
      </Table.Tr>
    ))
  ) : (
    <Table.Tr>
      <Table.Td colSpan={5} className="italic">
        No users found
      </Table.Td>
    </Table.Tr>
  );

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>User</Table.Th>
            <Table.Th>Position</Table.Th>
            <Table.Th>Roles</Table.Th>
            <Table.Th># of Products</Table.Th>
            <Table.Th>Last active</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
