'use client';

import { Avatar, Group, Table, Text } from '@mantine/core';
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

  const UniqueLicencePlates = ({
    projects,
  }: {
    projects: {
      licencePlate: string;
    }[];
  }) => {
    const uniquePlates = Array.from(new Set(projects.map((project) => project.licencePlate)));

    if (uniquePlates.length === 0) {
      return (
        <Text size="xs" c="dimmed">
          No data
        </Text>
      );
    }

    return (
      <Text size="xs" c="dimmed" component="span">
        {uniquePlates.map((licencePlate) => (
          <span key={licencePlate}>
            <CopyableButton>{licencePlate}</CopyableButton>
          </span>
        ))}
      </Text>
    );
  };

  const [billings] = methods.watch(['billings']);

  const rows =
    billings.length > 0 ? (
      billings.map((billing, index) => (
        <Table.Tr key={billing.id ?? index}>
          {/* Account coding */}
          <Table.Td style={{ overflow: 'hidden' }}>
            <Text size="xs" className="font-semibold">
              Client code
            </Text>
            <Text size="xs" c="dimmed" component="span">
              {billing.accountCoding.slice(0, 3)}
            </Text>
            <Text size="xs" className="font-semibold">
              Responsibility centre
            </Text>
            <Text size="xs" c="dimmed" component="span">
              {billing.accountCoding.slice(3, 8)}
            </Text>
            <Text size="xs" className="font-semibold">
              Service line
            </Text>
            <Text size="xs" c="dimmed" component="span">
              {billing.accountCoding.slice(8, 13)}
            </Text>
            <Text size="xs" className="font-semibold">
              Standard object of expense
            </Text>
            <Text size="xs" c="dimmed" component="span">
              {billing.accountCoding.slice(13, 17)}
            </Text>
            <Text size="xs" className="font-semibold">
              Project code
            </Text>
            <Text size="xs" c="dimmed" component="span">
              {billing.accountCoding.slice(17, 24)}
            </Text>

            <Text size="xs" c="dimmed" component="span">
              <CopyableButton trancatedLen={1}>{billing.accountCoding}</CopyableButton>
            </Text>
          </Table.Td>

          {/* products and requests */}
          <Table.Td>
            <Text size="xs" className="font-semibold">
              Initial licence plate
            </Text>
            <Text size="xs" c="dimmed">
              <CopyableButton>{billing.licencePlate}</CopyableButton>
            </Text>
            <Text size="xs" className="font-semibold">
              Requested products
            </Text>
            <UniqueLicencePlates projects={billing.publicCloudRequestedProjects} />
            <Text size="xs" className="font-semibold">
              Products
            </Text>
            <UniqueLicencePlates projects={billing.publicCloudProjects} />
          </Table.Td>

          {/* Dates */}
          <Table.Td>
            <Text size="xs" className="font-semibold">
              Created at
            </Text>
            <Text size="sm" c="dimmed">
              {formatDate(billing.createdAt)}
            </Text>
            <Text size="xs" className="font-semibold">
              Updated at
            </Text>
            <Text size="sm" c="dimmed">
              {formatDate(billing.updatedAt)}
            </Text>
          </Table.Td>

          {/* Approved By */}
          <Table.Td>
            {billing.approved ? (
              <Group gap="sm">
                <Avatar src={getUserImageData(billing.approvedBy?.image)} size={36} radius="xl" />
                <div>
                  <Text size="sm" className="font-semibold">
                    {formatFullName(billing.approvedBy)}
                    <MinistryBadge className="ml-1" ministry={billing.approvedBy?.ministry} />
                  </Text>
                  <Text size="xs" opacity={0.5}>
                    {billing.approvedBy?.email}
                  </Text>
                  <Text size="sm" className="font-light mt-1">
                    At: {formatDate(billing.approvedAt)}
                  </Text>
                </div>
              </Group>
            ) : (
              <Text size="xs" c="dimmed">
                No data
              </Text>
            )}
          </Table.Td>
          {/* Signed By */}
          <Table.Td>
            {billing.signed ? (
              <Group gap="sm">
                <Avatar src={getUserImageData(billing.signedBy?.image)} size={36} radius="xl" />
                <div>
                  <Text size="sm" className="font-semibold">
                    {formatFullName(billing.signedBy)}
                    <MinistryBadge className="ml-1" ministry={billing.signedBy?.ministry} />
                  </Text>
                  <Text size="xs" opacity={0.5}>
                    {billing.signedBy?.email}
                  </Text>
                  <Text size="sm" className="font-light mt-1">
                    At: {formatDate(billing.signedAt)}
                  </Text>
                </div>
              </Group>
            ) : (
              <Text size="xs" c="dimmed">
                No data
              </Text>
            )}
          </Table.Td>
        </Table.Tr>
      ))
    ) : (
      <Table.Tr>
        <Table.Td colSpan={5} className="italic text-center">
          No billings found
        </Table.Td>
      </Table.Tr>
    );

  return (
    <Table.ScrollContainer minWidth={800}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Account coding</Table.Th>
            <Table.Th>Products and requests</Table.Th>
            <Table.Th>Dates</Table.Th>
            <Table.Th>Approved by</Table.Th>
            <Table.Th>Signed by</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
