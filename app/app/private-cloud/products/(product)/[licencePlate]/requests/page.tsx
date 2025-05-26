'use client';

import { Switch, Tooltip } from '@mantine/core';
import { IconListDetails, IconHistoryToggle } from '@tabler/icons-react';
import { ReactNode, useEffect, useState } from 'react';
import { z } from 'zod';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';
import { usePrivateProductState } from '@/states/global';
import HistoryView from './HistoryView';
import ListView from './ListView';

const pathParamSchema = z.object({
  licencePlate: z.string(),
});

const privateCloudProductRequests = createClientPage({
  roles: [GlobalRole.User],
  validations: { pathParams: pathParamSchema },
  fallbackUrl: '/login?callbackUrl=/home',
});
export default privateCloudProductRequests(({ getPathParams, session }) => {
  const [, snap] = usePrivateProductState();
  const [checked, setChecked] = useState(false);
  const [pathParams, setPathParams] = useState<z.infer<typeof pathParamSchema>>();

  useEffect(() => {
    getPathParams().then((v) => setPathParams(v));
  }, []);

  const { licencePlate = '' } = pathParams ?? {};

  const toggle = (
    <div className="flex justify-end mb-2">
      <Switch
        checked={checked}
        onChange={(event) => setChecked(event.currentTarget.checked)}
        size="md"
        color="dark.4"
        onLabel={
          <Tooltip label="List view">
            <IconListDetails size={16} stroke={2.5} color="var(--mantine-color-blue-6)" />
          </Tooltip>
        }
        offLabel={
          <Tooltip label="History view">
            <IconHistoryToggle size={16} stroke={2.5} color="var(--mantine-color-green-6)" />
          </Tooltip>
        }
      />
      <span className="ml-2 text-gray-500 text-sm">Switch mode</span>
    </div>
  );

  return (
    <>
      {toggle}
      {checked ? <HistoryView licencePlate={licencePlate} /> : <ListView licencePlate={licencePlate} />}
    </>
  );
});
