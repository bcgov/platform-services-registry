'use client';

import _compact from 'lodash-es/compact';
import _difference from 'lodash-es/difference';
import _flatten from 'lodash-es/flatten';
import _uniq from 'lodash-es/uniq';
import { Session } from 'next-auth';
import EmptySearch from '@/components/EmptySearch';
import CopyableButton from '@/components/generic/button/CopyableButton';
import KeyValueTable from '@/components/generic/KeyValueTable';
import BillingStatusProgress from '@/components/public-cloud/BillingStatusProgress';
import { getAccountCodingString } from '@/helpers/billing';
import { usePublicProductState } from '@/states/global';
import { PublicCloudBillingSimpleDecorated } from '@/types/public-cloud';

interface TableProps {
  data: PublicCloudBillingSimpleDecorated[];
  session: Session;
}

export default function TableBody({ data, session }: TableProps) {
  const [, publicProductSnap] = usePublicProductState();

  if (data.length === 0) {
    return <EmptySearch />;
  }

  return (
    <div className="divide-y divide-grey-200/5">
      {data.map((billing, index) => {
        if (!publicProductSnap.currentProduct) return null;
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
                <BillingStatusProgress
                  billing={billing}
                  data={{
                    name: publicProductSnap.currentProduct.name,
                    provider: publicProductSnap.currentProduct.provider,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
