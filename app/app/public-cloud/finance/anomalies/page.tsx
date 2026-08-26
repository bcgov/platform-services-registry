'use client';

import { Button, Checkbox, Textarea } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { openConfirmModal } from '@/components/modal/confirm';
import { failure, success } from '@/components/notification';
import { formatCadAmount } from '@/components/public-cloud/finance/finance-measure-utils';
import FinanceNav from '@/components/public-cloud/finance/FinanceNav';
import FinanceQueryState from '@/components/public-cloud/finance/FinanceQueryState';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { getFinanceAnomalies, reviewFinanceAnomaly } from '@/services/backend/public-cloud/finance';

const publicCloudFinanceAnomaliesPage = createClientPage({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
});

export default publicCloudFinanceAnomaliesPage(({ session }) => {
  const [includeReviewed, setIncludeReviewed] = useState(false);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['finance-anomalies', includeReviewed],
    queryFn: () => getFinanceAnomalies(includeReviewed),
    enabled: Boolean(session?.previews.publicCloudFinance),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, reviewNote }: { id: string; reviewNote: string }) => reviewFinanceAnomaly(id, reviewNote),
    onSuccess: async () => {
      success({ message: 'Flag marked reviewed' });
      await queryClient.invalidateQueries({ queryKey: ['finance-anomalies'] });
      await queryClient.invalidateQueries({ queryKey: ['finance-snapshot'] });
    },
    onError: () => failure({ message: 'Unable to review flag' }),
  });

  if (!session?.previews.publicCloudFinance) return null;

  return (
    <div className="pt-5">
      <h1 className="text-xl lg:text-2xl font-semibold mb-2">Anomaly review queue</h1>
      <p className="text-sm text-gray-600 mb-4">
        Internal. What should we be asking about before the executive does. Expect a high false-positive rate.
      </p>
      <FinanceNav />

      {data && (
        <div className="mb-4 rounded border bg-gray-50 p-3 text-sm">
          <div className="font-medium mb-1">Configured thresholds</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Month-over-month increase above {data.thresholds.momIncreasePercent}%</li>
            <li>Actual over forecast by more than {data.thresholds.overForecastPercent}%</li>
            <li>New service line above CA${data.thresholds.newServiceLineMinCad}</li>
          </ul>
        </div>
      )}

      <Checkbox
        className="mb-4"
        label="Include reviewed flags"
        checked={includeReviewed}
        onChange={(e) => setIncludeReviewed(e.currentTarget.checked)}
      />

      <FinanceQueryState
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        title="Could not load anomalies"
        isReady={Boolean(data) && !isLoading}
      >
        {data && (
          <table className="min-w-full text-sm border bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-2 text-left">
                  Project identifier
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Rule
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Period
                </th>
                <th scope="col" className="px-3 py-2 text-right">
                  Amount
                </th>
                <th scope="col" className="px-3 py-2 text-left">
                  Review
                </th>
              </tr>
            </thead>
            <tbody>
              {data.flags.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-sm text-gray-500">
                    No flags in this queue.
                  </td>
                </tr>
              ) : null}
              {data.flags.map(
                (flag: {
                  id: string;
                  licencePlate: string;
                  productName: string;
                  ruleLabel: string;
                  serviceLine: string | null;
                  year: number;
                  month: number;
                  currentAmountCad: number;
                  reviewedAt: string | null;
                  reviewedBy: string | null;
                  reviewNote: string | null;
                }) => (
                  <tr key={flag.id}>
                    <td className="px-3 py-2 align-top">
                      <div className="font-mono text-xs">{flag.licencePlate}</div>
                      <div>{flag.productName}</div>
                      {flag.serviceLine && <div className="text-xs text-gray-500">{flag.serviceLine}</div>}
                    </td>
                    <td className="px-3 py-2 align-top">{flag.ruleLabel}</td>
                    <td className="px-3 py-2 align-top">
                      {flag.year}-{String(flag.month).padStart(2, '0')}
                    </td>
                    <td className="px-3 py-2 align-top text-right">{formatCadAmount(flag.currentAmountCad)}</td>
                    <td className="px-3 py-2 align-top min-w-56">
                      {flag.reviewedAt ? (
                        <div className="text-xs text-gray-600">
                          Reviewed {new Date(flag.reviewedAt).toLocaleString('en-CA')} by {flag.reviewedBy}
                          {flag.reviewNote ? <div className="mt-1">{flag.reviewNote}</div> : null}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Textarea
                            aria-label={`Review note for ${flag.licencePlate}`}
                            minRows={2}
                            value={notes[flag.id] ?? ''}
                            onChange={(e) => setNotes((prev) => ({ ...prev, [flag.id]: e.currentTarget.value }))}
                          />
                          <Button
                            size="xs"
                            loading={reviewMutation.isPending}
                            onClick={async () => {
                              const { state } = await openConfirmModal({
                                content: `Mark this flag for ${flag.licencePlate} as reviewed?`,
                              });
                              if (state.confirmed) {
                                reviewMutation.mutate({
                                  id: flag.id,
                                  reviewNote: notes[flag.id] || 'Reviewed',
                                });
                              }
                            }}
                          >
                            Mark reviewed
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        )}
      </FinanceQueryState>
    </div>
  );
});
