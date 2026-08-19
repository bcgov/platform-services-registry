'use client';

import { Button, TextInput } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import LoadingBox from '@/components/generic/LoadingBox';
import { failure, success } from '@/components/notification';
import { formatCadAmount } from '@/components/public-cloud/finance/finance-measure-utils';
import FinanceNav from '@/components/public-cloud/finance/FinanceNav';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { getFinanceUnmatched, resolveFinanceUnmatched } from '@/services/backend/public-cloud/finance';

const publicCloudFinanceUnmatchedPage = createClientPage({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
});

export default publicCloudFinanceUnmatchedPage(({ session }) => {
  const [resolvePlate, setResolvePlate] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['finance-unmatched'],
    queryFn: () => getFinanceUnmatched(),
    enabled: Boolean(session?.previews.publicCloudFinance),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, licencePlate }: { id: string; licencePlate: string }) =>
      resolveFinanceUnmatched(id, licencePlate),
    onSuccess: async () => {
      success({ message: 'Unmatched line resolved' });
      await queryClient.invalidateQueries({ queryKey: ['finance-unmatched'] });
    },
    onError: () => failure({ message: 'Unable to resolve line' }),
  });

  if (!session?.previews.publicCloudFinance) return null;

  return (
    <div className="pt-5">
      <h1 className="text-xl lg:text-2xl font-semibold mb-2">Unmatched billing</h1>
      <p className="text-sm text-gray-600 mb-4">
        Internal. Billing lines that could not be joined to a product. Prefer billingAccountLinks; otherwise AWS_LZA
        uses awsAccounts and Azure uses azureSubscriptions. Classic AWS has no native account field.
      </p>
      <FinanceNav />

      {isLoading || !data ? (
        <LoadingBox isLoading>
          <div className="min-h-24" />
        </LoadingBox>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-3" role="note">
            {data.note} Period: {data.year}-{String(data.month).padStart(2, '0')}
          </p>
          <table className="min-w-full text-sm border bg-white">
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
                  Resolve to project identifier
                </th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map(
                (line: {
                  id: string;
                  provider: string;
                  accountIdentifier: string;
                  serviceLine: string;
                  amountCad: number;
                  resolvedTo: string | null;
                }) => (
                  <tr key={line.id}>
                    <td className="px-3 py-2">{line.provider}</td>
                    <td className="px-3 py-2 font-mono text-xs">{line.accountIdentifier}</td>
                    <td className="px-3 py-2">{line.serviceLine}</td>
                    <td className="px-3 py-2 text-right">{formatCadAmount(line.amountCad)}</td>
                    <td className="px-3 py-2">
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
                            onClick={() =>
                              resolveMutation.mutate({
                                id: line.id,
                                licencePlate: resolvePlate[line.id]?.trim() || '',
                              })
                            }
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
          </table>
        </>
      )}
    </div>
  );
});
