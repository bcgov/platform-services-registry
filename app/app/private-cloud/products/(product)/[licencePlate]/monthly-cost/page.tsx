'use client';

import { Button } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import LoadingBox from '@/components/generic/LoadingBox';
import MonthlyCostSummary from '@/components/private-cloud/monthly-cost/MonthlyCostSummary';
import MonthlyCostTable from '@/components/private-cloud/monthly-cost/MonthlyCostTable';
import MonthlyCostChart from '@/components/private-cloud/monthly-cost/MonthyCostChart';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { downloadPrivateCloudMonthlyCosts, getMonthlyCosts } from '@/services/backend/private-cloud/products';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductMonthlyCost = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductMonthlyCost(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, [getPathParams]);

  const { licencePlate = '' } = pathParams ?? {};

  const { data, isLoading, isError } = useQuery({
    queryKey: ['costItems', licencePlate, selectedDate ? format(selectedDate, 'yyyy-MM') : null],
    queryFn: () => getMonthlyCosts(licencePlate, format(selectedDate!, 'yyyy-MM')),
    enabled: !!licencePlate && !!selectedDate,
  });

  if (!data || !session?.previews.costRecovery) {
    return null;
  }

  const handleChange = (date: Date | null) => {
    setSelectedDate(date || new Date());
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Monthly Bills</h1>
      <div className="flex items-center gap-4 mb-6">
        <MonthPickerInput
          label="Select Month"
          placeholder="Pick month"
          value={selectedDate}
          onChange={handleChange}
          maw={200}
          clearable
        />
        {data.items.length > 0 && (
          <div className="ml-auto">
            <Button
              loading={downloading}
              onClick={async () => {
                if (!data) return;
                setDownloading(true);
                await downloadPrivateCloudMonthlyCosts(licencePlate, format(selectedDate, 'yyyy-MM'));
                setDownloading(false);
              }}
            >
              Download PDF
            </Button>
          </div>
        )}
      </div>

      <div className="border rounded p-4 grid grid-cols-2 gap-4 bg-gray-50 my-6">
        <MonthlyCostSummary data={data} />
      </div>

      <div className="my-8">
        <MonthlyCostChart data={{ days: data.days, dayDetails: data.dayDetails }} selectedDate={selectedDate} />
      </div>

      <LoadingBox isLoading={isLoading}>
        <MonthlyCostTable data={{ items: data.items }} />
      </LoadingBox>
    </div>
  );
});
