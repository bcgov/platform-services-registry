import { Avatar, Badge, Table, Group, Text, Button, UnstyledButton } from '@mantine/core';
import { User, PrivateCloudProductMember } from '@prisma/client';
import { IconPlus } from '@tabler/icons-react';
import _get from 'lodash-es/get';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import FormMultiSelect from '@/components/generic/select/FormMultiSelect';
import { openConfirmModal } from '@/components/modal/confirm';
import { openUserPickerModal } from '@/components/modal/userPicker';
import { privateCloudProductMemberRoles } from '@/constants';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { formatDate, cn } from '@/utils/js';

export default function AdditionalTeamMembers({ disabled }: { disabled?: boolean }) {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
  });

  const [values] = watch(['members']);
  const members = values as (User & PrivateCloudProductMember)[];

  const rows = members.length ? (
    members.map((member, index) => (
      <Table.Tr key={member.id ?? index}>
        <Table.Td>
          <Group
            gap="sm"
            className={cn({
              'cursor-pointer': !disabled,
            })}
            onClick={async () => {
              if (disabled) return;

              const { state } = await openUserPickerModal({});
              if (state.user) {
                setValue(
                  `members.${index}`,
                  { ...member, ...state.user, userId: state.user.id },
                  { shouldDirty: true },
                );
              }
            }}
          >
            <Avatar src={getUserImageData(member.image)} size={36} radius="xl" />
            <div>
              <Text size="sm" className="font-semibold">
                {member.id ? (
                  <div>
                    {formatFullName(member)}
                    {member.ministry && (
                      <Badge color="dark" variant="light" className="ml-1">
                        {member.ministry}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <UnstyledButton className="text-gray-700 hover:underline">Click to select member</UnstyledButton>
                )}
              </Text>
              <Text size="xs" opacity={0.5}>
                {member.email}
              </Text>
            </div>
          </Group>
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
              data={privateCloudProductMemberRoles}
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
      <p>
        Additional members can be added to grant privileges on the registry application. These privileges are for
        the&nbsp;<span className="font-semibold">registry only</span>, and do not control access to OpenShift
        namespaces.
      </p>
      <p>
        These members can be managed by the product owner or the product&apos;s technical lead(s). The available roles
        include:
      </p>
      <ul className="list-disc pl-5">
        <li>
          <span className="font-semibold">Viewer</span>: Has read-only access to the product.
        </li>
        <li>
          <span className="font-semibold">Editor</span>: Can edit the product and submit edit requests.
        </li>
        <li>
          <span className="font-semibold">Subscriber</span>: Receives email notifications about product-related
          activities.
        </li>
      </ul>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Member</Table.Th>
              <Table.Th>Position</Table.Th>
              <Table.Th>Roles</Table.Th>
              <Table.Th>Last active</Table.Th>
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
