import { Avatar, Badge, Table, UnstyledButton, Button, Text, Group } from '@mantine/core';
import { User } from '@prisma/client';
import { IconMinus } from '@tabler/icons-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { openConfirmModal } from '@/components/modal/confirm';
import { openUserPickerModal } from '@/components/modal/userPicker';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { cn, formatDate } from '@/utils/js';
import SupportContact from './SupportContact';

interface UserAttribute {
  role: string;
  content: string;
  key: string;
  isOptional?: boolean;
}

interface TeamContactsProps {
  disabled?: boolean;
  hasEA: boolean;
  userAttributes?: UserAttribute[];
  secondTechLead: boolean;
  secondTechLeadOnClick: () => void;
}

export default function TeamContacts({
  disabled,
  hasEA = false,
  userAttributes = [],
  secondTechLead,
  secondTechLeadOnClick,
}: TeamContactsProps) {
  const {
    setValue,
    watch,
    formState: { errors },
    register,
  } = useFormContext();

  const users: { [key: string]: Partial<User> | null } = {};

  userAttributes.forEach((attr) => {
    const user = watch(attr.key);
    users[attr.key] = user || null;
  });

  const handleUpdateContact = async (index: number) => {
    const { state } = await openUserPickerModal({});
    const updatedUser = { ...state.user };
    const key = userAttributes[index].key;

    setValue(`${key}Id`, updatedUser.id);
    setValue(key, updatedUser, { shouldDirty: true });
  };

  const handleRemoveSecondaryTechnicalLead = async () => {
    const key = userAttributes.find((attr) => attr.isOptional)?.key;
    if (!key) return null;

    const res = await openConfirmModal({
      content: 'Are you sure you want to remove the secondary technical lead from this product?',
    });
    if (res?.state.confirmed) {
      secondTechLeadOnClick();
      setValue(`${key}Id`, null);
      setValue(key, null, { shouldDirty: true });
    }
  };

  if (!hasEA) {
    userAttributes = userAttributes.filter((_, index) => index !== 3);
  }

  const filteredUserAttributes = userAttributes.map(({ role, key, isOptional }, index) => {
    const user = users[key];
    const canShow = user && !disabled && isOptional;

    return (
      <Table.Tr key={index}>
        <Table.Td>
          {role}
          {isOptional && <span className="italic font-bold"> (Optional)</span>}
        </Table.Td>
        <Table.Td>
          <Group
            gap="sm"
            onClick={() => handleUpdateContact(index)}
            className={cn({
              'cursor-pointer': !disabled,
            })}
          >
            <Avatar src={getUserImageData(user?.image)} size={36} radius="xl" />
            <div>
              <Text size="sm" className="font-semibold">
                {user?.id ? (
                  <div>
                    {formatFullName(user)}
                    {user?.ministry && (
                      <Badge color="dark" variant="light" className="ml-1">
                        {user.ministry}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <UnstyledButton className="text-gray-700 hover:underline">Click to select user</UnstyledButton>
                )}
              </Text>
              <Text size="xs" opacity={0.5}>
                {user?.email}
              </Text>
            </div>
          </Group>
        </Table.Td>

        <Table.Td>
          {user?.jobTitle && (
            <div>
              <Badge color="primary" variant="light">
                {user?.jobTitle}
              </Badge>
            </div>
          )}
          {user?.officeLocation && (
            <div>
              <Badge color="info" variant="gradient">
                {user?.officeLocation}
              </Badge>
            </div>
          )}
        </Table.Td>

        <Table.Td className="italic">{formatDate(user?.lastSeen) || <span>has not yet logged in</span>}</Table.Td>
        <Table.Td>
          {canShow && (
            <Button color="danger" size="sm" onClick={handleRemoveSecondaryTechnicalLead} leftSection={<IconMinus />}>
              Remove
            </Button>
          )}
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <>
      <>
        <p className="mt-5 ml-2">Here&apos;s an overview of the key contacts for your product:</p>
        <ul className="list-disc pl-5 ml-2">
          {userAttributes.map((attr, index) => (
            <li key={index}>
              <span className="font-semibold">{attr.role}</span>: {attr.content}
            </li>
          ))}
        </ul>
      </>
      <input type="hidden" {...register('primaryTechnicalLead')} />
      <p className="mt-5 text-red-500">{errors.primaryTechnicalLead?.message?.toString()}</p>
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
          <Table.Tbody>{filteredUserAttributes}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <SupportContact />
    </>
  );
}
