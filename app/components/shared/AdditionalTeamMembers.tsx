import { Badge, Table, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import _get from 'lodash-es/get';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { openConfirmModal } from '@/components/modal/confirm';
import { openUserPickerModal } from '@/components/modal/userPicker';
import UserProfile from '@/components/users/UserProfile';
import { formatFullName } from '@/helpers/user';
import { User } from '@/prisma/client';
import { formatDate, cn } from '@/utils/js';
import TooltipTableHeader from './TooltipTableHeader';

export default function AdditionalTeamMembers<
  T extends {
    userId: string;
    roles: string[];
  },
>({ disabled, memberRoles, children }: { disabled?: boolean; memberRoles: string[]; children?: React.ReactNode }) {
  const { control, setValue, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
  });

  const [values] = watch(['members']);
  const members = values as (User & T)[];

  const rows = members.length ? (
    members.map((member, index) => (
      <Table.Tr key={member.id ?? index}>
        <Table.Td>
          <UserProfile
            data={member}
            onClick={async () => {
              if (disabled) return;

              const { state } = await openUserPickerModal({ initialValue: member }, { initialState: { user: member } });
              if (state.user) {
                setValue(
                  `members.${index}`,
                  { ...member, ...state.user, userId: state.user.id },
                  { shouldDirty: true },
                );
              }
            }}
          />
        </Table.Td>

        <Table.Td>
          {member.jobTitle && (
            <div>
              <Badge color="info" variant="filled">
                {member.jobTitle}
              </Badge>
            </div>
          )}
          {member.officeLocation && (
            <div>
              <Badge color="primary" variant="filled">
                {member.officeLocation}
              </Badge>
            </div>
          )}
        </Table.Td>

        <Table.Td>
          {member.id && (
            <FormMultiSelect
              name="roles"
              data={memberRoles}
              value={member.roles}
              onChange={(roles) => {
                setValue(`members.${index}`, { ...member, roles }, { shouldDirty: true });
              }}
              disabled={disabled}
            />
          )}
        </Table.Td>
        <Table.Td className="italic">{formatDate(member.lastSeen) || <span>has not yet logged in</span>}</Table.Td>
        <Table.Td>
          {!disabled && (
            <Button
              color="danger"
              size="sm"
              onClick={async () => {
                if (member.id) {
                  const res = await openConfirmModal({
                    content: (
                      <div>
                        Are you sure you want to remove <span className="font-semibold">{formatFullName(member)}</span>?
                      </div>
                    ),
                  });

                  if (res.state.confirmed) {
                    remove(index);
                  }
                } else {
                  remove(index);
                }
              }}
            >
              Delete
            </Button>
          )}
        </Table.Td>
      </Table.Tr>
    ))
  ) : (
    <Table.Tr>
      <Table.Td colSpan={5} className="italic">
        No members found
      </Table.Td>
    </Table.Tr>
  );

  return (
    <>
      {children}
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Member</Table.Th>
              <Table.Th>Position</Table.Th>
              <Table.Th>Roles</Table.Th>
              <TooltipTableHeader label="The last active date/time in the registry.">Last active</TooltipTableHeader>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {!disabled && members.length < 10 && (
        <Button color="green" size="xs" leftSection={<IconPlus />} onClick={() => append({ userId: '', roles: [] })}>
          Add New
        </Button>
      )}
    </>
  );
}
