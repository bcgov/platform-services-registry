'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AccountCoding } from '@prisma/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { proxy, useSnapshot } from 'valtio';
import { z } from 'zod';
import Table from '@/components/generic/table/Table';
import { openConfirmModal } from '@/components/modal/confirm';
import AccountCodingSection from '@/components/public-cloud/sections/AccountCoding';
import { requestSortsInProduct, GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { searchPublicCloudBillings } from '@/services/backend/public-cloud/billings';
import { updateAccountCoding as _updateAccountCoding } from '@/services/backend/public-cloud/products';
import { usePublicProductState } from '@/states/global';
import { PublicCloudBillingSimpleDecorated } from '@/types/public-cloud';
import { PublicCloudBillingBody, publicCloudBillingBodySchema } from '@/validation-schemas';
import { pageState } from './state';
import TableBody from './TableBody';

function AccountCodingForm({
  accountCoding,
  licencePlate,
  isDisabled,
}: {
  accountCoding?: AccountCoding | null;
  licencePlate: string;
  isDisabled: boolean;
}) {
  const [, publicCloudSnap] = usePublicProductState();

  const form = useForm({
    resolver: zodResolver(publicCloudBillingBodySchema),
    defaultValues: {
      accountCoding: accountCoding || {
        cc: '',
        rc: '',
        sl: '',
        stob: '',
        pc: '',
      },
    },
  });

  const {
    mutateAsync: updateAccountCoding,
    isPending: isUpdatingAccountCoding,
    isError: isUpdateAccountCodingError,
    error: updateAccountCodingError,
  } = useMutation({
    mutationFn: (data: any) => _updateAccountCoding(licencePlate, data),
  });

  const canEdit = publicCloudSnap.currentProduct?._permissions.editAccountCoding;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(async (formData) => {
          const res = await openConfirmModal({ content: 'Are you sure you want to update?', submitColor: 'primary' });
          if (res.state.confirmed) {
            await updateAccountCoding(formData);
          }
        })}
        autoComplete="off"
      >
        <AccountCodingSection
          isSubmitting={isUpdatingAccountCoding}
          disabled={!canEdit || isUpdatingAccountCoding || isDisabled}
        />
      </form>
    </FormProvider>
  );
}
const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const publicCloudProductBillings = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
  fallbackUrl: '/login?callbackUrl=/home',
});
export default publicCloudProductBillings(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const snap = useSnapshot(pageState);
  const { licencePlate = '' } = pathParams ?? {};

  const { data: billingData, isLoading } = useQuery({
    queryKey: ['billings', snap],
    queryFn: () => searchPublicCloudBillings({ licencePlate, includeMetadata: false }),
    refetchInterval: 1000,
    enabled: !!licencePlate,
  });

  let billings: PublicCloudBillingSimpleDecorated[] = [];
  let totalCount = 0;

  if (!isLoading && billingData) {
    billings = billingData.data;
    totalCount = billingData.totalCount;
  }

  return (
    <>
      {!isLoading && (
        <AccountCodingForm
          key={billings[0]?.id}
          accountCoding={billings.length > 0 ? billings[0].accountCoding : null}
          licencePlate={licencePlate}
          isDisabled={!billingData?.data[0].approved}
        />
      )}

      <h3 className="font-bold text-xl mt-3 mb-2">Billings</h3>
      <Table totalCount={totalCount} page={1} pageSize={50} isLoading={isLoading}>
        <TableBody data={billings} session={session!} />
      </Table>
    </>
  );
});
