import { Prisma } from '@prisma/client';
import _get from 'lodash-es/get';
import _startCase from 'lodash-es/startCase';
import _lowerCase from 'lodash-es/lowerCase';
import _isArray from 'lodash-es/isArray';
import Table, { Header, CellProcess } from './Table';

type Image = Prisma.AcsResultImageGetPayload<{
  select: {
    id: true;
    name: true;
    components: true;
    cves: true;
    fixableCves: true;
    created: true;
    lastUpdated: true;
    priority: true;
  };
}>;

const headers: Header<Image>[] = [
  { field: 'name', headerName: 'Image' },
  { field: 'cves', headerName: 'CVEs' },
  { field: 'fixableCves', headerName: 'Fixable CVEs' },
  { field: 'components', headerName: 'Components' },
  { field: 'priority', headerName: 'Risk Priority' },
  { field: 'created', headerName: 'Created', type: 'Date' },
];

export default async function Images({ data, url }: { data: Image[]; url?: string }) {
  return (
    <Table<Image>
      title={`Images (${data.length})`}
      data={data}
      linkHref={url}
      linkTitle="Images Details"
      headers={headers}
    />
  );
}
