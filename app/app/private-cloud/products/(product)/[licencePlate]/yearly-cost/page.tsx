'use client';
import { YearPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSnapshot } from 'valtio';
import { z } from 'zod';
import Empty from '@/components/assets/empty.svg';
import LoadingBox from '@/components/generic/LoadingBox';
import YearlyCostChart from '@/components/private-cloud/yearly-cost/YearlyCostChart';
import YearlyCostTable from '@/components/private-cloud/yearly-cost/YearlyCostTable';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { getTransformedCostData } from '@/helpers/product';
import { getYearlyCosts } from '@/services/backend/private-cloud/products';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductCostHistory = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductCostHistory(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());

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
  const transformedData = getTransformedCostData(yearlyCostData || []);

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
      <div className="my-8">
        <YearlyCostChart data={transformedData} />
      </div>
      <LoadingBox isLoading={isLoading}>
        <YearlyCostTable data={transformedData} currentYear={year} />
      </LoadingBox>
    </div>
  );
});
