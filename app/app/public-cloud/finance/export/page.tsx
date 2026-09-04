'use client';

import { Button, Checkbox, Select, SegmentedControl } from '@mantine/core';
import { useState } from 'react';
import { failure, success } from '@/components/notification';
import FinanceNav from '@/components/public-cloud/finance/FinanceNav';
import FinancePreviewDisabled from '@/components/public-cloud/finance/FinancePreviewDisabled';
import { GlobalPermissions } from '@/constants';
import createClientPage from '@/core/client-page';
import { Provider } from '@/prisma/client';
import { downloadFinanceExport } from '@/services/backend/public-cloud/finance';

const DATASET_OPTIONS = [
  { value: 'forecast', label: 'Forecast by month' },
  { value: 'actuals', label: 'Actuals by month' },
  { value: 'variance', label: 'Variance' },
  { value: 'product-rankings', label: 'Product rankings' },
  { value: 'service-line-rankings', label: 'Service line rankings' },
];

const publicCloudFinanceExportPage = createClientPage({
  permissions: [GlobalPermissions.ViewPublicCloudForecast],
});

export default publicCloudFinanceExportPage(({ session }) => {
  const [provider, setProvider] = useState('ALL');
  const [period, setPeriod] = useState<'ytd' | 'full-fy'>('ytd');
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [datasets, setDatasets] = useState<string[]>(DATASET_OPTIONS.map((d) => d.value));
  const [busy, setBusy] = useState(false);

  if (!session?.previews.publicCloudFinance) return <FinancePreviewDisabled />;

  return (
    <div className="pt-5 max-w-3xl">
      <h1 className="text-xl lg:text-2xl font-semibold mb-2">Finance export</h1>
      <p className="text-sm text-gray-600 mb-4">
        Excel workbook or CSV. Variance notes and anomaly flags are never included.
      </p>
      <FinanceNav />

      <div className="space-y-4 bg-white border rounded-lg p-4">
        <SegmentedControl
          value={provider}
          onChange={setProvider}
          data={[
            { label: 'All', value: 'ALL' },
            { label: 'AWS LZA', value: Provider.AWS_LZA },
            { label: 'Azure', value: Provider.AZURE },
            { label: 'AWS', value: Provider.AWS },
          ]}
          aria-label="Provider filter"
        />
        <Select
          label="Period"
          value={period}
          onChange={(v) => setPeriod((v as 'ytd' | 'full-fy') || 'ytd')}
          data={[
            { value: 'ytd', label: 'Fiscal year to date' },
            { value: 'full-fy', label: 'Full fiscal year' },
          ]}
        />
        <Select
          label="Format"
          value={format}
          onChange={(v) => setFormat((v as 'xlsx' | 'csv') || 'xlsx')}
          data={[
            { value: 'xlsx', label: 'Excel workbook' },
            { value: 'csv', label: 'CSV' },
          ]}
        />
        <fieldset>
          <legend className="text-sm font-medium mb-2">Datasets</legend>
          <div className="space-y-2">
            {DATASET_OPTIONS.map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={datasets.includes(option.value)}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setDatasets((prev) => (checked ? [...prev, option.value] : prev.filter((v) => v !== option.value)));
                }}
              />
            ))}
          </div>
        </fieldset>
        <Button
          loading={busy}
          disabled={datasets.length === 0}
          onClick={async () => {
            setBusy(true);
            try {
              const downloaded = await downloadFinanceExport({
                format,
                provider,
                period,
                datasets: datasets.join(','),
              });
              if (!downloaded) failure({ message: 'Nothing to export for the selected datasets.' });
              else success({ message: 'Export downloaded.' });
            } catch {
              failure({ message: 'Export failed.' });
            } finally {
              setBusy(false);
            }
          }}
        >
          Download export
        </Button>
      </div>
    </div>
  );
});
