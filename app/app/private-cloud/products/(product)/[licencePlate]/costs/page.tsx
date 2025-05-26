'use client';

import { Tabs } from '@mantine/core';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import Monthly from './Monthly';
import Quarterly from './Quarterly';
import Yearly from './Yearly';

const tabClassname = `
  relative bg-white hover:bg-gray-50 border border-solid border-gray-500
  first:rounded-l-md rtl:first:rounded-r-md last:rounded-r-md rtl:last:rounded-l-md -ml-px first:ml-0 rtl:-mr-px rtl:first:mr-0
  data-[active=true]:z-10 data-[active=true]:bg-bcblue data-[active=true]:border-bcblue data-[active=true]:text-white data-[active=true]:hover:bg-bcblue
`;

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductCosts = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
});

export default privateCloudProductCosts(({ getPathParams, session }) => {
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();
  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, [getPathParams]);

  const { licencePlate = '' } = pathParams ?? {};

  if (!session) {
    return null;
  }

  return (
    <Tabs variant="unstyled" defaultValue="monthly">
      <Tabs.List grow className="max-w-2xl">
        <Tabs.Tab value="monthly" className={tabClassname}>
          Monthly
        </Tabs.Tab>
        <Tabs.Tab value="quarterly" className={tabClassname}>
          Quarterly
        </Tabs.Tab>
        <Tabs.Tab value="yearly" className={tabClassname}>
          Yearly
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="monthly" pt="xs">
        <Monthly licencePlate={licencePlate} session={session} />
      </Tabs.Panel>

      <Tabs.Panel value="quarterly" pt="xs">
        <Quarterly licencePlate={licencePlate} session={session} />
      </Tabs.Panel>

      <Tabs.Panel value="yearly" pt="xs">
        <Yearly licencePlate={licencePlate} session={session} />
      </Tabs.Panel>
    </Tabs>
  );
});
