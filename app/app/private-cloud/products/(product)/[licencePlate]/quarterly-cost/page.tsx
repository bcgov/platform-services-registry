'use client';

import { Button } from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format, getQuarter } from 'date-fns';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import LoadingBox from '@/components/generic/LoadingBox';
import QuarterlyCostChart from '@/components/private-cloud/quarterly-cost/QuarterlyCostChart';
import QuarterlyCostSummary from '@/components/private-cloud/quarterly-cost/QuarterlyCostSummary';
import QuarterlyCostTable from '@/components/private-cloud/quarterly-cost/QuarterlyCostTable';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { downloadPrivateCloudQuarterlyCosts, getQuarterlyCosts } from '@/services/backend/private-cloud/products';
import { formatAsYearQuarter } from '@/utils/js';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductQuarterlyCost = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductQuarterlyCost(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);
  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, [getPathParams]);

  const { licencePlate = '' } = pathParams ?? {};

  const { data, isLoading, isError } = useQuery({
    queryKey: ['costItems', licencePlate, selectedDate ? formatAsYearQuarter(selectedDate) : null],
    queryFn: () => getQuarterlyCosts(licencePlate, formatAsYearQuarter(selectedDate)),
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
      <h1 className="text-2xl font-bold mb-4">Quarterly Bills</h1>
      <div className="flex items-center gap-4 mb-6">
        <MonthPickerInput
          label="Select a Month within the Quarter"
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
                await downloadPrivateCloudQuarterlyCosts(licencePlate, formatAsYearQuarter(selectedDate));
                setDownloading(false);
              }}
            >
              Download PDF
            </Button>
          </div>
        )}
      </div>

      <QuarterlyCostSummary data={data} />

      <div className="my-8">
        <QuarterlyCostChart data={{ months: data.months, monthDetails: data.monthDetails }} />
      </div>

      <LoadingBox isLoading={isLoading}>
        <QuarterlyCostTable data={{ items: data.items }} />
      </LoadingBox>
    </div>
  );
});
