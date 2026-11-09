'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { proxy, useSnapshot } from 'valtio';
import { z } from 'zod';
import Table from '@/components/generic/table/Table';
import { openConfirmModal } from '@/components/modal/confirm';
import { failure, success } from '@/components/notification';
import AccountCodingSection from '@/components/public-cloud/sections/AccountCoding';
import { requestSortsInProduct, GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import AgreementAppendixV2 from '@/helpers/pdfs/emou/AgreementAppendixV2';
import AgreementTermsV2 from '@/helpers/pdfs/emou/AgreementTermsV2';
import { AccountCoding } from '@/prisma/client';
import { renewPublicCloudBilling, searchPublicCloudBillings } from '@/services/backend/public-cloud/billings';
import { updateAccountCoding as _updateAccountCoding } from '@/services/backend/public-cloud/products';
import { usePublicProductState } from '@/states/global';
import { PublicCloudBillingSimpleDecorated } from '@/types/public-cloud';
import { PublicCloudBillingBody, publicCloudBillingBodySchema } from '@/validation-schemas';
import { pageState } from './state';
import TableBody from './TableBody';

function AccountCodingForm({
  accountCoding,
  licencePlate,
}: {
  accountCoding?: AccountCoding | null;
  licencePlate: string;
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
        <AccountCodingSection isSubmitting={isUpdatingAccountCoding} disabled={!canEdit} />
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

  const queryClient = useQueryClient();
  const [, publicProductSnap] = usePublicProductState();

  const { mutateAsync: renewBilling, isPending: isRenewing } = useMutation({
    mutationFn: () => renewPublicCloudBilling(licencePlate),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['billings'] });
      success();
    },
    onError: (error: Error) => {
      failure({ error });
    },
  });

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

  const canRenew =
    !!publicProductSnap.currentProduct?._permissions.editAccountCoding &&
    billings.some((billing) => billing.approved && (billing.agreementVersion ?? 1) === 1) &&
    !billings.some((billing) => billing.approved && billing.agreementVersion === 2);

  return (
    <>
      {!isLoading && (
        <AccountCodingForm
          key={billings[0]?.id}
          accountCoding={billings.length > 0 ? billings[0].accountCoding : null}
          licencePlate={licencePlate}
        />
      )}

      <div className="flex items-center justify-between mt-3 mb-2">
        <h3 className="font-bold text-xl">Billings</h3>

        {canRenew && (
          <Button
            loading={isRenewing}
            onClick={async () => {
              const product = publicProductSnap.currentProduct;
              if (!product) return;

              const res = await openConfirmModal({
                content: (
                  <div>
                    <AgreementTermsV2 name={product.name} provider={product.provider} />
                    <AgreementAppendixV2 />
                  </div>
                ),
                submitColor: 'primary',
              });

              if (!res.state.confirmed) return;

              try {
                await renewBilling();
              } catch {
                // Error notification is handled by onError.
              }
            }}
          >
            Re-sign eMOU
          </Button>
        )}
      </div>
      <Table totalCount={totalCount} page={1} pageSize={50} isLoading={isLoading}>
        <TableBody data={billings} session={session!} />
      </Table>
    </>
  );
});
