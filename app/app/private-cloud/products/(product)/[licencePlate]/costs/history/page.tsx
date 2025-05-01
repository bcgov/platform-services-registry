'use client';

import { Button } from '@mantine/core';
import { YearPickerInput } from '@mantine/dates';
import { useQuery } from '@tanstack/react-query';
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
import {
  downloadPrivateCloudYearlyCostHstory,
  getPrivateCloudProductYearlyCostHistory,
} from '@/services/backend/private-cloud/products';
import { pageState } from './state';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductCostHistory = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductCostHistory(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  const { year } = useSnapshot(pageState);

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const { licencePlate = '' } = pathParams ?? {};

  const { data: data, isLoading: isLoading } = useQuery({
    queryKey: ['getPrivateCloudProductYearlyCostHistory', licencePlate, year],
    queryFn: () => getPrivateCloudProductYearlyCostHistory(licencePlate, year),
    enabled: !!licencePlate && !!year,
  });

  const setSelectedYear = (year: Date | null) => {
    if (year) {
      pageState.year = year.getFullYear().toString();
    } else {
      pageState.year = new Date().getFullYear().toString();
    }
  };
  const yearlyCostData = data?.items;
  const transformedYearlyCostData = getTransformedCostData(yearlyCostData || []);

  return (
    <>
      <YearPickerInput
        label="Select Year"
        placeholder="Select Year"
        value={new Date(parseInt(year), 0, 1)}
        onChange={(year) => setSelectedYear(year)}
        maw={200}
        clearable
      />
      <LoadingBox isLoading={isLoading}>
        {yearlyCostData && yearlyCostData.length > 0 ? (
          <>
            <div className="flex justify-end mb-4">
              <Button
                color="success"
                loading={downloading}
                onClick={async () => {
                  setDownloading(true);
                  await downloadPrivateCloudYearlyCostHstory(licencePlate, year);
                  setDownloading(false);
                }}
              >
                Download PDF
              </Button>
            </div>
            <YearlyCostChart data={transformedYearlyCostData} title={`Cost History for ${year}`} />
            <YearlyCostTable data={transformedYearlyCostData} currentYear={year} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 mt-12">
            <Image
              alt="Empty"
              src={Empty}
              width={172}
              height={128}
              style={{
                maxWidth: '100%',
                height: 'auto',
              }}
            />
            <span className="text-xl font-bold text-mediumgrey mt-4">There is no cost history for {year}</span>
          </div>
        )}
      </LoadingBox>
    </>
  );
});
