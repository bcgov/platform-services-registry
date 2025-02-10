'use client';

import { Badge, Table, Button } from '@mantine/core';
import { Provider } from '@prisma/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import _difference from 'lodash-es/difference';
import _flatten from 'lodash-es/flatten';
import _uniq from 'lodash-es/uniq';
import { Session } from 'next-auth';
import { useState } from 'react';
import CopyableButton from '@/components/generic/button/CopyableButton';
import ExternalLink from '@/components/generic/button/ExternalLink';
import KeyValueTable from '@/components/generic/KeyValueTable';
import UserProfile from '@/components/users/UserProfile';
import { getEmouFileName } from '@/helpers/emou';
import { downloadBilling } from '@/services/backend/billing';
import { BillingSearchResponseDataItem, BillingSearchResponseMetadata } from '@/types/billing';
import { formatDate } from '@/utils/js';

interface TableProps {
  data: BillingSearchResponseDataItem[];
  metadata: BillingSearchResponseMetadata;
  session: Session;
}

export default function TableBody({ data, metadata, session }: TableProps) {
  const [downloading, setDownloading] = useState(false);

  const rows =
    data.length > 0 ? (
      data.map((billing, index) => {
        const associations = [
          ...metadata.publicProducts.filter(({ billingId }) => billingId === billing.id),
          ...metadata.publicRequests.filter(({ billingId }) => billingId === billing.id),
        ];

        return (
          <Table.Tr key={billing.id ?? index}>
            <Table.Td className="align-top">
              <KeyValueTable
                data={{
                  'Client code': billing.accountCoding.slice(0, 3),
                  'Responsibility centre': billing.accountCoding.slice(3, 8),
                  'Service line': billing.accountCoding.slice(8, 13),
                  'Standard object of expense': billing.accountCoding.slice(13, 17),
                  'Project code': billing.accountCoding.slice(17, 24),
                }}
                showHeader={false}
              />

              <CopyableButton className="text-gray-600">{billing.accountCoding}</CopyableButton>
            </Table.Td>

            <Table.Td className="align-top">
              {associations.map(({ id, name, url, type, context, licencePlate }) => {
                return (
                  <div key={id} className="hover:bg-gray-100 transition-colors duration-200 px-2 py-1 text-base">
                    <span className="font-semibold">{name}</span>
                    <span className="italic ml-1">({licencePlate})</span>
                    {type === 'request' && (
                      <Badge color="primary" size="xs" className="ml-1">
                        New
                      </Badge>
                    )}
                    {session.permissions.downloadBillingMou && (
                      <Button
                        loading={downloading}
                        color="primary"
                        size="compact-xs"
                        className="ml-2"
                        onClick={async () => {
                          setDownloading(true);
                          await downloadBilling(
                            billing.accountCoding,
                            context,
                            licencePlate,
                            getEmouFileName(name, context),
                          );
                          setDownloading(false);
                        }}
                      >
                        Download
                      </Button>
                    )}

                    <ExternalLink href={url} className="ml-2" />
                  </div>
                );
              })}
            </Table.Td>

            <Table.Td className="align-top">
              <ul className="list-disc">
                <li>
                  <div className="font-semibold">
                    Created at <span className="italic font-normal">{formatDate(billing.createdAt)}</span>
                  </div>
                </li>

                {billing.signed && billing.signedBy && (
                  <li>
                    <div className="font-semibold mt-5">
                      Signed at <span className="italic font-normal">{formatDate(billing.signedAt)}</span>; by
                    </div>
                    <UserProfile data={billing.signedBy} />
                  </li>
                )}

                {billing.approved && billing.approvedBy && (
                  <li>
                    <div className="font-semibold mt-5">
                      Reviewed at <span className="italic font-normal">{formatDate(billing.approvedAt)}</span>; by
                    </div>
                    <UserProfile data={billing.approvedBy} />
                  </li>
                )}
              </ul>
            </Table.Td>
          </Table.Tr>
        );
      })
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
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
