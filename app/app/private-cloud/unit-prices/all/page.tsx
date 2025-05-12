'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Table, Badge, Button } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useQuery, useMutation } from '@tanstack/react-query';
import _compact from 'lodash-es/compact';
import _get from 'lodash-es/get';
import { ReactNode, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import FormErrorNotification from '@/components/generic/FormErrorNotification';
import HookFormTextInput from '@/components/generic/input/HookFormTextInput';
import LoadingBox from '@/components/generic/LoadingBox';
import { openConfirmModal } from '@/components/modal/confirm';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import {
  getPrivateCloudUnitPrice,
  getPrivateCloudUnitPrices,
  upsertPrivateCloudUnitPrice,
  deletePrivateCloudUnitPrice,
} from '@/services/backend/private-cloud/unit-prices';
import { formatCurrency, getYyyyMmDd, getDateFromYyyyMmDd, toStartOfDay } from '@/utils/js';
import { PrivateCloudUnitPriceBody, privateCloudUnitPriceBodySchema } from '@/validation-schemas';

const PrivateCloudUnitPricesPage = createClientPage({
  permissions: [GlobalPermissions.ViewPrivateCloudUnitPrices],
});
export default PrivateCloudUnitPricesPage(({ session }) => {
  const [date, setDate] = useState<Date | null>(new Date());

  const methods = useForm({
    resolver: zodResolver(privateCloudUnitPriceBodySchema),
    defaultValues: {
      cpu: 0,
      storage: 0,
    },
    disabled: !session?.permissions.managePrivateCloudUnitPrices,
  });

  const {
    data: unitPrice,
    isLoading: isUnitPriceLoading,
    isError: isUnitPriceError,
    error: unitPriceError,
    refetch: refetchUnitPrice,
  } = useQuery({
    queryKey: ['unitPrice', date],
    queryFn: () => getPrivateCloudUnitPrice(getYyyyMmDd(date ?? new Date())),
    refetchInterval: 2000,
    enabled: !!session,
  });

  const {
    data: unitPrices,
    isLoading: isUnitPricesLoading,
    isError: isUnitPricesError,
    error: unitPricesError,
    refetch: refetchUnitPrices,
  } = useQuery({
    queryKey: ['unitPrices'],
    queryFn: () => getPrivateCloudUnitPrices(),
    refetchInterval: 2000,
    enabled: !!session,
  });

  const {
    mutateAsync: upsertUnitPrice,
    isPending: isUpsertingUnitPrice,
    isError: isUpsertingPriceError,
    error: upsertingPriceError,
  } = useMutation({
    mutationFn: ({ cpu, storage }: PrivateCloudUnitPriceBody) => {
      if (!date) {
        return Promise.resolve({ cpu: -1, storage: -1 });
      }

      return upsertPrivateCloudUnitPrice(getYyyyMmDd(date), { cpu, storage });
    },
  });

  const {
    mutateAsync: deleteUnitPrice,
    isPending: isDeletingUnitPrice,
    isError: isDeletingPriceError,
    error: deletingPriceError,
  } = useMutation({
    mutationFn: (date: string) => {
      return deletePrivateCloudUnitPrice(date);
    },
  });

  useEffect(() => {
    if (unitPrice) {
      methods.setValue('cpu', unitPrice.cpu);
      methods.setValue('storage', unitPrice.storage);
    } else {
      methods.setValue('cpu', 0);
      methods.setValue('storage', 0);
    }
  }, [unitPrice]);

  if (!session) {
    return null;
  }

  let rows: ReactNode = null;
  if (!unitPrices || unitPrices.length === 0) {
    const message = 'No unit prices found.';

    rows = (
      <Table.Tr>
        <Table.Td colSpan={4}>{message}</Table.Td>
      </Table.Tr>
    );
  } else {
    rows = (unitPrices || []).map((price) => {
      return (
        <Table.Tr key={price.id}>
          <Table.Td>
            <span className="whitespace-nowrap">{price.date}</span>
          </Table.Td>

          <Table.Td className="text-right">{formatCurrency(price.cpu)}</Table.Td>
          <Table.Td className="text-right">{formatCurrency(price.storage)}</Table.Td>
          <Table.Td className="text-right">
            <Button
              className="mr-1"
              color="danger"
              variant="outline"
              onClick={async () => {
                const today = toStartOfDay(new Date());
                const target = toStartOfDay(getDateFromYyyyMmDd(price.date));

                const isAfterToday = target.getTime() > today.getTime();
                const res = await openConfirmModal({
                  content: isAfterToday
                    ? 'Are you sure you want to proceed?'
                    : 'You are about to delete a previous unit price, which will affect past cost calculations. Are you sure you want to proceed?',
                });

                if (res.state.confirmed) {
                  await deleteUnitPrice(price.date);
                }
              }}
              disabled={!session.permissions.managePrivateCloudUnitPrices}
            >
              Delete
            </Button>
          </Table.Td>
        </Table.Tr>
      );
    });
  }

  return (
    <div className="pt-5">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 pb-2">
        Private Cloud Unit Prices
      </h1>
      <div className="grid grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="hidden col-span-1 lg:block"></div>

        <div className="bg-gray-100 p-4 rounded col-span-2">
          <DatePicker value={date} onChange={setDate} classNames={{ levelsGroup: 'mx-auto w-fit' }} />
        </div>

        <LoadingBox isLoading={isUnitPriceLoading} className="bg-gray-100 p-4 rounded col-span-2">
          {date && (
            <>
              <h4 className="mb-5 font-semibold">{getYyyyMmDd(date)}</h4>
              <FormProvider {...methods}>
                <FormErrorNotification />
                <form
                  onSubmit={methods.handleSubmit(async (formData) => {
                    if (!date) return;

                    const today = toStartOfDay(new Date());
                    const target = toStartOfDay(date);

                    let proceed = target.getTime() > today.getTime();
                    if (!proceed) {
                      const res = await openConfirmModal({
                        content:
                          'You are about to update the previous unit prices, which will affect past cost calculations. Are you sure you want to proceed?',
                      });
                      proceed = res.state.confirmed;
                    }

                    if (proceed) {
                      await upsertUnitPrice(formData);
                      await refetchUnitPrices();
                    }
                  })}
                  autoComplete="off"
                >
                  <HookFormTextInput
                    label="CPU (1Core)"
                    name="cpu"
                    placeholder="Enter CPU..."
                    required
                    options={{ valueAsNumber: true }}
                    classNames={{ wrapper: 'col-span-1 mb-2' }}
                  />
                  <HookFormTextInput
                    label="Storage (1GiB)"
                    name="storage"
                    placeholder="Enter storage..."
                    required
                    options={{ valueAsNumber: true }}
                    classNames={{ wrapper: 'col-span-1' }}
                  />

                  <div className="mt-5 flex items-center justify-start gap-x-2">
                    <Button type="submit" color="primary" disabled={!session.permissions.managePrivateCloudUnitPrices}>
                      Submit
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </>
          )}
        </LoadingBox>

        <div className="hidden col-span-1 lg:block"></div>
      </div>

      <LoadingBox isLoading={isUpsertingUnitPrice || isDeletingUnitPrice}>
        <Table striped verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th className="text-right">CPU (1Core)</Table.Th>
              <Table.Th className="text-right">Storage (1GiB)</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </LoadingBox>
    </div>
  );
});
