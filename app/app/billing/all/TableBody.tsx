'use client';

import { Avatar, Badge, Group, Table, Text } from '@mantine/core';
import { useForm } from 'react-hook-form';
import MinistryBadge from '@/components/badges/MinistryBadge';
import CopyableButton from '@/components/generic/button/CopyableButton';
import { formatFullName } from '@/helpers/user';
import { getUserImageData } from '@/helpers/user-image';
import { SearchBilling } from '@/services/db/billing';
import { formatDate } from '@/utils/js';

interface TableProps {
  data: SearchBilling[];
}

export default function TableBody({ data }: TableProps) {
  const methods = useForm({
    values: {
      billings: data,
    },
  });

  const [billings] = methods.watch(['billings']);

  const rows =
    billings.length > 0 ? (
      billings.map((billing, index) => (
        <Table.Tr key={billing.id ?? index}>
          <Table.Td>
            <Group gap="sm" className="cursor-pointer" onClick={async () => {}}>
              <ul>
                <li>
                  <Text size="xs" className="font-semibold">
                    Licence plate
                  </Text>
                  <Text size="xs" c="dimmed" component="span">
                    <CopyableButton>{billing.licencePlate}</CopyableButton>
                  </Text>
                </li>
                <li>
                  <Text size="xs" className="font-semibold">
                    Account coding
                  </Text>
                  <Text size="xs" c="dimmed" component="span">
                    <CopyableButton>{billing.accountCoding}</CopyableButton>
                  </Text>
                </li>
                <li>
                  <Text size="xs" className="font-semibold">
                    Create Date
                  </Text>
                  <Text size="xs" c="dimmed" component="span">
                    {formatDate(billing.createdAt)}
                  </Text>
                </li>
              </ul>
            </Group>
          </Table.Td>
          <Table.Td>
            {billing.expenseAuthority && (
              <Group gap="sm" className="cursor-pointer" onClick={async () => {}}>
                <Avatar src={getUserImageData(billing.expenseAuthority?.image)} size={36} radius="xl" />
                <div>
                  <Text size="sm" className="font-semibold">
                    {formatFullName(billing.expenseAuthority)}
                    <MinistryBadge className="ml-1" ministry={billing.expenseAuthority?.ministry} />
                  </Text>
                  <Text size="xs" opacity={0.5}>
                    {billing.expenseAuthority?.email}
                  </Text>
                </div>
              </Group>
            )}
          </Table.Td>
          <Table.Td>
            <Text size="xs">
              <div>
                <Badge color={billing.approved ? 'green' : 'red'} variant="filled" display="block">
                  {billing.approved ? '' : 'not '}approved
                </Badge>
                <Badge color={billing.signed ? 'green' : 'red'} variant="filled" mt="xs">
                  {billing.signed ? '' : 'not '}signed
                </Badge>
              </div>
            </Text>
          </Table.Td>
          <Table.Td>
            {billing.approved && (
              <Group gap="sm" className="cursor-pointer" onClick={async () => {}}>
                <Avatar src={getUserImageData(billing.approvedBy?.image)} size={36} radius="xl" />
                <div>
                  <Text size="sm" className="font-semibold">
                    {formatFullName(billing.approvedBy)}
                    <MinistryBadge className="ml-1" ministry={billing.approvedBy?.ministry} />
                  </Text>
                  <Text size="xs" opacity={0.5}>
                    {billing.approvedBy?.email}
                  </Text>
                </div>
              </Group>
            )}
          </Table.Td>
          <Table.Td>
            {billing.signed && (
              <Group gap="sm" className="cursor-pointer" onClick={async () => {}}>
                <Avatar src={getUserImageData(billing.signedBy?.image)} size={36} radius="xl" />
                <div>
                  <Text size="sm" className="font-semibold">
                    {formatFullName(billing.signedBy)}
                    <MinistryBadge className="ml-1" ministry={billing.signedBy?.ministry} />
                  </Text>
                  <Text size="xs" opacity={0.5}>
                    {billing.signedBy?.email}
                  </Text>
                </div>
              </Group>
            )}
          </Table.Td>
        </Table.Tr>
      ))
    ) : (
      <Table.Tr>
        <Table.Td colSpan={5} className="italic">
          No billings found
        </Table.Td>
      </Table.Tr>
    );

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Billing info</Table.Th>
            <Table.Th>Expense authority</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Approved by</Table.Th>
            <Table.Th>Signed by</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
