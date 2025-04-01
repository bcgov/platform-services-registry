import { Badge, Table, Button } from '@mantine/core';
import { User } from '@prisma/client';
import { IconMinus } from '@tabler/icons-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { openConfirmModal } from '@/components/modal/confirm';
import { openUserPickerModal } from '@/components/modal/userPicker';
import UserProfile from '@/components/users/UserProfile';
import { cn, formatDate } from '@/utils/js';
import FormError from '../generic/FormError';
import TooltipTableHeader from './TooltipTableHeader';

interface UserAttribute {
  role: string;
  content: string;
  key: string;
  isOptional?: boolean;
  blackListMessage?: string;
  blackListIds?: string[];
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
    register,
  } = useFormContext();

  const users = watch(userAttributes.map(({ key }) => key));

  const tableBody = userAttributes.map(({ role, key, isOptional, blackListIds = [], blackListMessage }, index) => {
    const user = users[index] ?? {};
    const canDelete = !disabled && isOptional;
    const handleUserChange = async () => {
      if (disabled) return;

      const resolvedBlacklistIds = blackListIds
        .map((idKey) => {
          const idx = userAttributes.findIndex((attr) => `${attr.key}Id` === idKey);
          return users[idx]?.id;
        })
        .filter(Boolean);

      const { state } = await openUserPickerModal(
        {
          initialValue: user,
          blackListIds: resolvedBlacklistIds,
          blackListMessage,
        },
        { initialState: { user } },
      );

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

    return (
      <Table.Tr key={key}>
        <Table.Td>
          {role}
          {isOptional && <span className="italic font-bold"> (Optional)</span>}
        </Table.Td>
        <Table.Td className="user-button">
          <UserProfile data={user} onClick={disabled ? undefined : handleUserChange} />
          <FormError field={`${key}Id`} className="mt-1" />
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
        <Table.Td>
          {canDelete && (
            <Button color="danger" size="sm" onClick={handleUserDelete} leftSection={<IconMinus />}>
              Remove
            </Button>
          )}
        </Table.Td>
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
      <p className="my-2 ml-2">
        Please ensure that the Product Owner and Primary Technical Lead are assigned to{' '}
        <span className="font-bold text-red-600">different</span> individuals.
      </p>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>User</Table.Th>
              <Table.Th>Position</Table.Th>
              <TooltipTableHeader label="The last active date/time in the registry.">Last active</TooltipTableHeader>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{tableBody}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
