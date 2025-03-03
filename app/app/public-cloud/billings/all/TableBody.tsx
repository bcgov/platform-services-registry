'use client';

import { Badge } from '@mantine/core';
import _compact from 'lodash-es/compact';
import _difference from 'lodash-es/difference';
import _flatten from 'lodash-es/flatten';
import _uniq from 'lodash-es/uniq';
import { Session } from 'next-auth';
import EmptySearch from '@/components/EmptySearch';
import CopyableButton from '@/components/generic/button/CopyableButton';
import ExternalLink from '@/components/generic/button/ExternalLink';
import KeyValueTable from '@/components/generic/KeyValueTable';
import BillingStatusProgress from '@/components/public-cloud/BillingStatusProgress';
import { getAccountCodingString } from '@/helpers/billing';
import {
  PublicCloudBillingSearchResponseMetadata,
  PublicCloudBillingSearchResponseMetadataProduct,
  PublicCloudBillingSimpleDecorated,
} from '@/types/public-cloud';

interface TableProps {
  data: PublicCloudBillingSimpleDecorated[];
  metadata: PublicCloudBillingSearchResponseMetadata;
  session: Session;
}

export default function TableBody({ data, metadata, session }: TableProps) {
  if (data.length === 0) {
    return <EmptySearch />;
  }

  return (
    <div className="divide-y divide-grey-200/5">
      {data.map((billing, index) => {
        if (!metadata) return null;

        let meta: PublicCloudBillingSearchResponseMetadataProduct | undefined;

        meta = metadata.publicProducts.find(({ licencePlate }) => licencePlate === billing.licencePlate);
        if (!meta) {
          meta = metadata.publicRequests.find(({ licencePlate }) => licencePlate === billing.licencePlate);
        }

        if (!meta) return null;

        const task = metadata.tasks.find(
          ({ data }) => (data as { licencePlate: string }).licencePlate === billing.licencePlate,
        );

        return (
          <div key={billing.id}>
            <div className="hover:bg-gray-100 transition-colors duration-200 grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 sm:px-6">
              <div className="md:col-span-4 text-sm">
                <KeyValueTable
                  data={{
                    'Client code': billing.accountCoding.cc,
                    'Responsibility centre': billing.accountCoding.rc,
                    'Service line': billing.accountCoding.sl,
                    'Standard object of expense': billing.accountCoding.stob,
                    'Project code': billing.accountCoding.pc,
                  }}
                  showHeader={false}
                />

                <CopyableButton className="text-gray-600 text-sm">
                  {getAccountCodingString(billing.accountCoding)}
                </CopyableButton>
              </div>

              <div className="md:col-span-8">
                <div className="px-2 py-1 text-base">
                  <span className="font-semibold">{meta.name}</span>
                  <span className="italic ml-1">({meta.licencePlate})</span>
                  {meta.type === 'request' && (
                    <Badge color="primary" size="xs" className="ml-1">
                      New
                    </Badge>
                  )}

                  <ExternalLink href={meta.url} className="ml-2" />
                </div>
                <BillingStatusProgress billing={billing} data={meta} task={task} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
