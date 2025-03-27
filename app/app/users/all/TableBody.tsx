'use client';

import { Badge, Table, Button } from '@mantine/core';
import _get from 'lodash-es/get';
import _isEqual from 'lodash-es/isEqual';
import _truncate from 'lodash-es/truncate';
import { Session } from 'next-auth';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import FormDatePicker from '@/components/generic/select/FormDatePicker';
import HookFormMultiSelect from '@/components/generic/select/HookFormMultiSelect';
import { failure, success } from '@/components/notification';
import TooltipTableHeader from '@/components/shared/TooltipTableHeader';
import UserProfile from '@/components/users/UserProfile';
import { updateUser } from '@/services/backend/user';
import { AdminViewUser } from '@/types/user';
import { formatDate } from '@/utils/js';
import ProductsCard from './ProductsCard';

interface TableProps {
  data: AdminViewUser[];
  availableRoles?: string[];
  session: Session;
}

export default function TableBody({ data, availableRoles = [], session }: TableProps) {
  const [savingOnboardingDate, setSavingOnboardingDate] = useState(false);

  const methods = useForm({
    values: {
      users: data,
    },
  });

  const [users] = methods.watch(['users']);

  const rows = users.length ? (
    users.map((item, index) => (
      <Table.Tr key={item.id}>
        <Table.Td>
          <UserProfile data={item} />
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
                <HookFormMultiSelect
                  name={`users.${index}.roles`}
                  data={availableRoles}
                  disabled={!session.permissions.editUserRoles}
                />
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

        <Table.Td className="italic">
          {session.permissions.editUserOnboardingDate ? (
            <FormDatePicker
              onChange={async (date) => {
                setSavingOnboardingDate(true);
                const result = await updateUser(item.id, {
                  onboardingDate: date ? date.toISOString() : null,
                });

                if (result.onboardingDate || result.onboardingDate === date) {
                  methods.setValue(
                    `users.${index}.onboardingDate`,
                    result.onboardingDate ? new Date(result.onboardingDate) : null,
                  );
                  success();
                } else {
                  failure({ message: 'Failed to update onboarding date', autoClose: true });
                }

                setSavingOnboardingDate(false);
              }}
              value={item.onboardingDate}
              loading={savingOnboardingDate}
              classNames={{ wrapper: 'col-span-4' }}
              placeholder="not available"
            />
          ) : (
            formatDate(item.onboardingDate) || ''
          )}
        </Table.Td>

        <Table.Td>
          <ProductsCard products={item.privateProducts} context="private-cloud">
            <Badge color="primary" variant="filled">
              {item.privateProducts.length}
            </Badge>
          </ProductsCard>

          <span className="mx-2">/</span>

          <ProductsCard products={item.publicProducts} context="public-cloud">
            <Badge color="success" variant="filled">
              {item.publicProducts.length}
            </Badge>
          </ProductsCard>
        </Table.Td>

        <Table.Td className="italic">{formatDate(item.lastSeen) || ''}</Table.Td>
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
                <Table.Th>Onboarding Date</Table.Th>
                <Table.Th># of Products</Table.Th>
                <TooltipTableHeader label="The last active date/time in the registry.">Last active</TooltipTableHeader>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </form>
    </FormProvider>
  );
}
