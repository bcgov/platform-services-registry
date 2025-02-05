import { Avatar, Badge, Table, UnstyledButton, Tooltip, TooltipFloating, Button, Text, Group } from '@mantine/core';
import { User } from '@prisma/client';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import _forEach from 'lodash-es/forEach';
import _get from 'lodash-es/get';
import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { openConfirmModal } from '@/components/modal/confirm';
import { openUserPickerModal } from '@/components/modal/userPicker';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { cn, formatDate } from '@/utils/js';

const getErrorMessage = (error: any): string | undefined => {
  if (error?.message) {
    return error.message;
  }
  return undefined;
};

export default function ModifiedTeamContacts({
  disabled,
  secondTechLead,
  secondTechLeadOnClick,
}: {
  disabled?: boolean;
  secondTechLead: boolean;
  secondTechLeadOnClick: () => void;
}) {
  const {
    setValue,
    watch,
    formState: { errors },
    register,
  } = useFormContext();

  const [projectOwner, setProjectOwner] = useState<Partial<User> | null>(null);
  const [primaryTechnicalLead, setPrimaryTechnicalLead] = useState<Partial<User> | null>(null);
  const [expenseAuthority, setExpenseAuthority] = useState<Partial<User> | null>(null);
  const [secondaryTechnicalLead, setSecondaryTechnicalLead] = useState<Partial<User> | null>(null);

  const [formProjectOwner, formPrimaryTechnicalLead, formExpenseAuthority, formSecondaryTechnicalLead] = watch([
    'projectOwner',
    'primaryTechnicalLead',
    'expenseAuthority',
    'secondaryTechnicalLead',
  ]);

  const phoneNumber = watch('supportPhoneNumber') || '';

  const handlePhoneNumberChange = (value: string) => {
    const numericValue = value.replace(/[()\s-]/g, '');
    setValue('supportPhoneNumber', numericValue || null);
  };

  useEffect(() => {
    _forEach(
      [
        [formProjectOwner, setProjectOwner],
        [formPrimaryTechnicalLead, setPrimaryTechnicalLead],
        [formExpenseAuthority, setExpenseAuthority],
        [formSecondaryTechnicalLead, setSecondaryTechnicalLead],
      ],
      ([value, setter]) => value && setter(value),
    );
  }, []);

  const handleUpdateContact = async (index: number) => {
    const { state } = await openUserPickerModal({});
    if (state.user) {
      const updatedUser = { ...state.user, userId: state.user.id };

      _get(
        [
          () => setProjectOwner(updatedUser),
          () => setPrimaryTechnicalLead(updatedUser),
          () => setExpenseAuthority(updatedUser),
          () => setSecondaryTechnicalLead(updatedUser),
        ],
        index,
      )?.();

      setValue(
        ['projectOwner', 'primaryTechnicalLead', 'expenseAuthority', 'secondaryTechnicalLead'][index],
        updatedUser,
        {
          shouldDirty: true,
        },
      );
    }
  };

  const handleRemoveSecondaryTechnicalLead = async () => {
    if (secondaryTechnicalLead) {
      const res = await openConfirmModal({
        content: 'Are you sure you want to remove the secondary technical lead from this product?',
      });
      if (res?.state.confirmed) {
        secondTechLeadOnClick();
        setSecondaryTechnicalLead(null);
      }
    } else {
      secondTechLeadOnClick();
      setSecondaryTechnicalLead(null);
    }
  };

  const userAttributes = [
    {
      role: 'Project Owner (PO)',
      user: projectOwner,
      content:
        'This is business owner of the application, and their contact information will be used for non-technical inquiries.',
    },
    {
      role: 'Primary Technical Lead (TL)',
      user: primaryTechnicalLead,
      content:
        'This is the DevOps specialist that handles technical queries and platform updates. A Primary Technical Lead is required.',
    },
    {
      role: 'Expense Authority (EA)',
      user: expenseAuthority,
      content:
        'Grants individuals permission to incur organizational expenses within set limits and guidelines. Use only an IDIR-linked email address below.',
    },
    {
      role: 'Secondary Technical Lead (TL)',
      user: secondaryTechnicalLead,
      content:
        'This is typically the DevOps specialist. We use this information to contact them with technical questions or notify them about platform events. You require a Primary Technical Lead, a Secondary Technical Lead is optional.',
    },
  ];

  const filteredUserAttributes = userAttributes
    .filter(({ role, user }) => role !== 'Secondary Technical Lead (TL)' || user !== null)
    .map(({ role, user }, index) => (
      <Table.Tr key={index}>
        <Table.Td>
          {role}
          {index === 3 && <span className="italic font-bold"> (Optional)</span>}
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
                {user.jobTitle}
              </Badge>
            </div>
          )}
          {user?.officeLocation && (
            <div>
              <Badge color="info" variant="gradient">
                {user.officeLocation}
              </Badge>
            </div>
          )}
        </Table.Td>

        <Table.Td className="italic">{formatDate(user?.lastSeen) || <span>has not yet logged in</span>}</Table.Td>
        <Table.Td>
          {!disabled && role === 'Secondary Technical Lead (TL)' && (
            <Button color="danger" size="sm" onClick={handleRemoveSecondaryTechnicalLead} leftSection={<IconMinus />}>
              Remove
            </Button>
          )}
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <>
      <>
        <p className="mt-5 ml-2">Here&apos;s an overview of the key contacts for your product:</p>
        <ul className="list-disc pl-5 ml-2">
          <li>
            <span className="font-semibold">Product Owner (PO)</span>: {userAttributes[0].content}
          </li>
          <li>
            <span className="font-semibold">Primary Technical Lead (TL)</span>: {userAttributes[1].content}
          </li>
          <li>
            <span className="font-semibold">Expense Authority (EA)</span>: {userAttributes[2].content}
          </li>
          <li>
            <span className="font-semibold">Secondary Technical Lead (TL)</span>: {userAttributes[3].content}
          </li>
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

      {!disabled && !secondaryTechnicalLead && (
        <Button
          className="mb-5 ml-3"
          color="green"
          size="xs"
          leftSection={<IconPlus />}
          onClick={() => setSecondaryTechnicalLead({})}
        >
          Add Secondary Technical Lead
        </Button>
      )}
      <div className="mt-6 flex flex-col flex-start">
        <h3 className="text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
          After-Hours support contact (optional)
        </h3>
        <p className="my-4 text-base leading-6 text-gray-600">
          For Business Mission Critical Applications Only. You can specify a phone number of your team member who should
          be contacted by the BC Government&apos;s Service Desk (7-7000) if an issue is reported for your product
          outside of business hours
        </p>
        <IMaskInput
          className="w-fit"
          mask="+1 (000) 000-0000"
          unmask={true}
          value={phoneNumber}
          onAccept={handlePhoneNumberChange}
          placeholder="+1 (999) 999-9999"
        />
        <p className="mt-3 text-sm leading-6 text-gray-600">{getErrorMessage(errors.supportPhoneNumber)}</p>
      </div>
    </>
  );
}
