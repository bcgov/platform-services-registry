'use client';

import { Button, NumberInput, SegmentedControl, TextInput } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { openConfirmModal } from '@/components/modal/confirm';
import { failure, success } from '@/components/notification';
import { currentCalendarMonth, formatCadAmount } from '@/components/public-cloud/finance/finance-measure-utils';
import FinancePageHeader from '@/components/public-cloud/finance/FinancePageHeader';
import FinancePreviewDisabled from '@/components/public-cloud/finance/FinancePreviewDisabled';
import FinanceQueryState from '@/components/public-cloud/finance/FinanceQueryState';
import FinanceTable, { financeTableRowClassName } from '@/components/public-cloud/finance/FinanceTable';
import { GlobalPermissions, financeProviderFilterOptions } from '@/constants';
import createClientPage from '@/core/client-page';
import { getFinanceUnmatched, resolveFinanceUnmatched } from '@/services/backend/public-cloud/finance';

const publicCloudFinanceUnmatchedPage = createClientPage({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
});

export default publicCloudFinanceUnmatchedPage(({ session }) => {
  const current = currentCalendarMonth();
  const [provider, setProvider] = useState('ALL');
  const [year, setYear] = useState(current.year);
  const [month, setMonth] = useState(current.month);
  const [resolvePlate, setResolvePlate] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['finance-unmatched', provider, year, month],
    queryFn: () => getFinanceUnmatched({ provider, year, month }),
    enabled: Boolean(session?.previews.publicCloudFinance),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, licencePlate }: { id: string; licencePlate: string }) =>
      resolveFinanceUnmatched(id, licencePlate),
    onSuccess: async () => {
      success({ message: 'Unmatched line resolved and attached to the product' });
      await queryClient.invalidateQueries({ queryKey: ['finance-unmatched'] });
      await queryClient.invalidateQueries({ queryKey: ['finance-snapshot'] });
    },
    onError: () => failure({ message: 'Unable to resolve line' }),
  });

  if (!session?.previews.publicCloudFinance) return <FinancePreviewDisabled />;

  return (
    <div className="pt-5">
      <FinancePageHeader
        title="Unmatched billing"
        description="Billing lines that did not match a product account or subscription. Enter a project identifier to attach a line. Classic AWS is not included."
      />

      <div className="mb-2 flex flex-wrap items-end gap-3">
        <SegmentedControl
          value={provider}
          onChange={setProvider}
          data={[{ label: 'All providers', value: 'ALL' }, ...financeProviderFilterOptions]}
          aria-label="Provider filter"
        />
        <NumberInput
          label="Year"
          value={year}
          min={2000}
          max={2100}
          onChange={(value) => setYear(Number(value) || year)}
        />
        <NumberInput
          label="Month"
          value={month}
          min={1}
          max={12}
          onChange={(value) => setMonth(Number(value) || month)}
        />
      </div>

      <FinanceQueryState
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        title="Could not load unmatched billing"
        isReady={Boolean(data) && !isLoading}
      >
        {data && (
          <FinanceTable caption={`Unmatched billing lines for ${data.year}-${String(data.month).padStart(2, '0')}`}>
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">
                  Provider
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Account / subscription
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Service line
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Amount
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Resolve this row
                </th>
              </tr>
            </thead>
            <tbody>
              {data.lines.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-sm text-gray-500">
                    No unmatched billing lines for this period.
                  </td>
                </tr>
              ) : null}
              {data.lines.map(
                (line: {
                  id: string;
                  provider: string;
                  accountIdentifier: string;
                  serviceLine: string;
                  amountCad: number;
                  resolvedTo: string | null;
                }) => (
                  <tr key={line.id} className={financeTableRowClassName}>
                    <td className="px-3 py-2">{line.provider}</td>
                    <td className="px-3 py-2 font-mono text-xs">{line.accountIdentifier}</td>
                    <td className="px-3 py-2">{line.serviceLine}</td>
                    <td className="px-3 py-2 text-right">{formatCadAmount(line.amountCad)}</td>
                    <td className="px-3 py-2 border-l border-gray-200">
                      {line.resolvedTo ? (
                        <span className="text-xs text-gray-600">Resolved to {line.resolvedTo}</span>
                      ) : (
                        <div className="flex gap-2 items-end">
                          <TextInput
                            aria-label={`Resolve ${line.accountIdentifier}`}
                            placeholder="project identifier"
                            value={resolvePlate[line.id] ?? ''}
                            onChange={(e) => setResolvePlate((prev) => ({ ...prev, [line.id]: e.currentTarget.value }))}
                          />
                          <Button
                            size="xs"
                            loading={resolveMutation.isPending}
                            onClick={async () => {
                              const licencePlate = resolvePlate[line.id]?.trim() || '';
                              if (!licencePlate) {
                                failure({ message: 'Enter a project identifier' });
                                return;
                              }
                              const { state } = await openConfirmModal({
                                content: `Attach this billing line to ${licencePlate}? This writes spend and a billing account link.`,
                              });
                              if (state.confirmed) {
                                resolveMutation.mutate({ id: line.id, licencePlate });
                              }
                            }}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </FinanceTable>
        )}
      </FinanceQueryState>
    </div>
  );
});
