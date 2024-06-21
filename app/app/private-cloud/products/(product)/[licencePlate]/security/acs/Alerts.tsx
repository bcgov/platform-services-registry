import { Prisma } from '@prisma/client';
import _get from 'lodash/get';
import _isArray from 'lodash/isArray';
import _isFunction from 'lodash/isFunction';
import _lowerCase from 'lodash/lowerCase';
import _startCase from 'lodash/startCase';
import Table, { Header, CellProcess } from './Table';

type Alert = Prisma.AcsResultAlertGetPayload<{
  select: {
    id: true;
    lifecycleStage: true;
    time: true;
    state: true;
    enforcementCount: true;
    enforcementAction: true;
    policy: true;
    commonEntityInfo: true;
    deployment: true;
  };
}>;

const headers: Header<Alert>[] = [
  { field: 'policy.name', headerName: 'Policy' },
  { field: 'deployment.name', headerName: 'Entity' },
  {
    field: 'commonEntityInfo.resourceType',
    headerName: 'Type',
    process: ({ value, field, headerName, type, row }: CellProcess<Alert>) => {
      return _startCase(_lowerCase(value));
    },
  },
  {
    field: 'policy.severity',
    headerName: 'Security',
    process: ({ value, field, headerName, type, row }: CellProcess<Alert>) => {
      return _startCase(_lowerCase(value.split('_')[0]));
    },
  },
  { field: 'policy.categories', headerName: 'Categories' },
  { field: 'lifecycleStage', headerName: 'Lifecycle' },
  { field: 'time', headerName: 'Time', type: 'Date' },
];

export default async function Alerts({ data, url }: { data: Alert[]; url?: string }) {
  return (
    <Table<Alert>
      title={`Alerts (${data.length})`}
      data={data}
      linkHref={url}
      linkTitle="Violations Details"
      headers={headers}
    />
  );
}
