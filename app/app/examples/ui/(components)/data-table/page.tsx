'use client';

import { faker } from '@faker-js/faker';
import _startCase from 'lodash-es/startCase';
import DataTable from '@/components/generic/table/DataTable';
import { GlobalRole } from '@/constants/user';
import createClientPage from '@/core/client-page';

function generateSampleData(count: number) {
  return Array.from({ length: count }, () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    sex: faker.person.sex(),
  }));
}

const columns: {
  label: string;
  value: string;
  cellProcessor: (item: { firstName: string; lastName: string; sex: string }) => React.ReactNode;
}[] = [
  { label: 'First Name', value: 'firstName', cellProcessor: (item) => _startCase(item.firstName) },
  { label: 'Last Name', value: 'lastName', cellProcessor: (item) => _startCase(item.lastName) },
  { label: 'Sex', value: 'sex', cellProcessor: (item) => <i>{item.sex}</i> },
];

const Page = createClientPage({
  roles: [GlobalRole.User],
});

export default Page(() => {
  return <DataTable data={generateSampleData(100)} columns={columns} defaultPageSize={5} />;
});
