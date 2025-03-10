import { Badge, Table, Tooltip } from '@mantine/core';
import { IconEdit } from '@tabler/icons-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { openConfirmModal } from '@/components/modal/confirm';
import { openUserPickerModal } from '@/components/modal/userPicker';
import UserProfile from '@/components/users/UserProfile';
import { formatDate } from '@/utils/js';

interface UserAttribute {
  role: string;
  content: string;
  key: string;
  isOptional?: boolean;
}

interface Props {
  disabled?: boolean;
  userAttributes: UserAttribute[];
}

export default function TeamContacts({ disabled, userAttributes }: Props) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const users = watch(userAttributes.map(({ key }) => key));

  const tableBody = userAttributes.map(({ role, key, isOptional }, index) => {
    const user = users[index] ?? {};
    const canDelete = !disabled && isOptional;

    const handleUserChange = async () => {
      if (disabled) return;

      const { state } = await openUserPickerModal({ initialValue: user }, { initialState: { user } });
      const updatedUser = state.user ? { ...state.user } : { id: null };

      setValue(`${key}Id`, updatedUser.id);
      setValue(key, updatedUser, { shouldDirty: true });
    };

    const handleUserDelete = async () => {
      if (!canDelete) return;

      const { state } = await openConfirmModal({
        content: 'Are you sure you want to remove the secondary technical lead from this product?',
      });

      if (state.confirmed) {
        setValue(`${key}Id`, null);
        setValue(key, {}, { shouldDirty: true });
      }
    };

    const iconClickHandler = disabled ? undefined : canDelete ? handleUserDelete : handleUserChange;

    const tooltipLabel = `${canDelete ? 'Delete' : 'Edit'} Member`;

    return (
      <Table.Tr key={key}>
        <Table.Td>
          {role}
          {isOptional && <span className="italic font-bold"> (Optional)</span>}
        </Table.Td>
        <Table.Td className="flex">
          <UserProfile data={user} onClick={disabled ? undefined : handleUserChange} />
          {user.email && (
            <Tooltip label={tooltipLabel}>
              <IconEdit className="ml-2" onClick={iconClickHandler} />
            </Tooltip>
          )}
        </Table.Td>
        <Table.Td>
          {user.jobTitle && (
            <Badge color="primary" variant="filled" className="block">
              {user.jobTitle}
            </Badge>
          )}
          {user.officeLocation && (
            <Badge color="info" variant="filled" className="block">
              {user.officeLocation}
            </Badge>
          )}
        </Table.Td>
        <Table.Td className="italic">{formatDate(user.lastSeen) || <span>has not yet logged in</span>}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      <p className="mt-5 ml-2">Here&apos;s an overview of the key contacts for your product:</p>
      <ul className="list-disc pl-5 ml-2">
        {userAttributes.map((attr, index) => (
          <li key={index}>
            <span className="font-semibold">{attr.role}</span>: {attr.content}
          </li>
        ))}
      </ul>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>User</Table.Th>
              <Table.Th>Position</Table.Th>
              <Table.Th>Last active</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{tableBody}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
