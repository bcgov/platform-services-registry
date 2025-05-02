'use client';
import { Button } from '@mantine/core';
import { YearPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import LoadingBox from '@/components/generic/LoadingBox';
import YearlyCostChart from '@/components/private-cloud/yearly-cost/YearlyCostChart';
import YearlyCostTable from '@/components/private-cloud/yearly-cost/YearlyCostTable';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { downloadPrivateCloudYearlyCosts, getYearlyCosts } from '@/services/backend/private-cloud/products';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductYearlyCost = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductYearlyCost(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, [getPathParams]);

  const { licencePlate = '' } = pathParams ?? {};
  const year = selectedYear.getFullYear().toString();

  const { data, isLoading } = useQuery({
    queryKey: ['costItems', licencePlate, year],
    queryFn: () => getYearlyCosts(licencePlate, year),
    enabled: !!licencePlate && !!selectedYear,
  });

  if (!data || !session?.previews.costRecovery) {
    return null;
  }

  const handleChange = (year: Date | null) => {
    setSelectedYear(year ?? new Date());
  };

  const yearlyCostData = data?.items;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Yearly Bills</h1>
      <div className="flex items-center gap-4 mb-6">
        <YearPickerInput
          label="Select Year"
          placeholder="Pick Year"
          value={selectedYear}
          onChange={handleChange}
          maw={200}
          clearable
        />
      </div>
      {data.items.length > 0 && (
        <div className="ml-auto">
          <Button
            loading={downloading}
            onClick={async () => {
              if (!data) return;
              setDownloading(true);
              await downloadPrivateCloudYearlyCosts(licencePlate, year);
              setDownloading(false);
            }}
          >
            Download PDF
          </Button>
        </div>
      )}
      <div className="my-8">
        <YearlyCostChart yearlyCostData={yearlyCostData} />
      </div>
      <LoadingBox isLoading={isLoading}>
        <YearlyCostTable yearlyCostData={yearlyCostData} currentYear={year} />
      </LoadingBox>
    </div>
  );
});
