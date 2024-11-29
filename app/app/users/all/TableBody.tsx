'use client';

import { Avatar, Badge, Table, Group, Text, UnstyledButton, Pill, Button } from '@mantine/core';
import _get from 'lodash-es/get';
import _isEqual from 'lodash-es/isEqual';
import _truncate from 'lodash-es/truncate';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import HookFormMultiSelect from '@/components/generic/select/HookFormMultiSelect';
import { failure, success } from '@/components/notification';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { updateUser } from '@/services/backend/user';
import { AdminViewUser } from '@/types/user';
import { formatDate } from '@/utils/date';
import PrivateCloudProductsCard from './PrivateCloudProductsCard';

interface TableProps {
  data: AdminViewUser[];
  disabled?: boolean;
  availableRoles?: string[];
}

export default function TableBody({ data, disabled = false, availableRoles = [] }: TableProps) {
  const methods = useForm({
    values: {
      users: data,
    },
  });

  const [users] = methods.watch(['users']);

  const rows = users.length ? (
    users.map((item, index) => (
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
              <Badge color="info" variant="filled">
                {item.jobTitle}
              </Badge>
            </div>
          )}
          {item.officeLocation && (
            <div>
              <Badge color="primary" variant="filled">
                {item.officeLocation}
              </Badge>
            </div>
          )}
        </Table.Td>

        <Table.Td>
          {item.id && (
            <div className="grid grid-cols-10">
              <div className="col-span-7 max-w-md">
                <HookFormMultiSelect name={`users.${index}.roles`} data={availableRoles} disabled={disabled} />
              </div>
              <div className="col-span-3">
                {!_isEqual(users[index]?.roles, data[index]?.roles) && (
                  <div className="mx-1 flex gap-1">
                    <Button
                      color="primary"
                      size="compact-sm"
                      onClick={async () => {
                        const result = await updateUser(item.id, { roles: users[index].roles });
                        if (result) {
                          data[index].roles = [...result.roles];
                          methods.setValue(`users.${index}.roles`, [...result.roles]);
                          success();
                        } else {
                          failure({ message: 'Failed to assign roles', autoClose: true });
                        }
                      }}
                    >
                      save
                    </Button>
                    <Button
                      color="secondary"
                      size="compact-sm"
                      onClick={() => {
                        methods.setValue(`users.${index}.roles`, data[index].roles);
                      }}
                    >
                      cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Table.Td>
        <Table.Td>
          <PrivateCloudProductsCard products={item.privateProducts} context="private-cloud">
            <Badge color="primary" variant="filled">
              {item.privateProducts.length}
            </Badge>
          </PrivateCloudProductsCard>

          <span className="mx-2">/</span>

          <PrivateCloudProductsCard products={item.publicProducts} context="public-cloud">
            <Badge color="success" variant="filled">
              {item.publicProducts.length}
            </Badge>
          </PrivateCloudProductsCard>
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
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(async (formData) => {})} autoComplete="off">
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
      </form>
    </FormProvider>
  );
}
