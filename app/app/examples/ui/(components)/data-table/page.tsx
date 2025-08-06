'use client';

import { faker } from '@faker-js/faker';
import _startCase from 'lodash-es/startCase';
import DataTable from '@/components/generic/data-table/DataTable';
import { GlobalRole } from '@/constants/user';
import createClientPage from '@/core/client-page';

function generateSampleData(count: number) {
  return Array.from({ length: count }, () => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    age: faker.number.int({ min: 18, max: 80 }),
  }));
}
interface Person {
  firstName: string;
  lastName: string;
  age: number;
}
interface columnDef {
  label?: string;
  value: string;
  cellFormatter: (item: Person, attr: string) => React.ReactNode;
}
const columns: columnDef[] = [
  { label: 'First Name', value: 'firstName', cellFormatter: (item, attr) => _startCase(item.firstName) },
  { label: 'Last Name', value: 'lastName', cellFormatter: (item, attr) => _startCase(item.lastName) },
  { label: 'Age', value: 'age', cellFormatter: (item, attr) => <i>{item.age}</i> },
];

const columnsWithoutLabel: columnDef[] = [
  { value: 'firstName', cellFormatter: (item, attr) => _startCase(item.firstName) },
  { value: 'lastName', cellFormatter: (item, attr) => _startCase(item.lastName) },
  { label: 'Age', value: 'age', cellFormatter: (item, attr) => <i>{item.age}</i> },
];

const columnsWithEmptyLabel: columnDef[] = [
  { value: 'firstName', cellFormatter: (item, attr) => _startCase(item.firstName) },
  { label: '', value: 'lastName', cellFormatter: (item, attr) => _startCase(item.lastName) },
  { label: 'Age', value: 'age', cellFormatter: (item, attr) => <i>{item.age}</i> },
];

const Page = createClientPage({
  roles: [GlobalRole.User],
});

export default Page(() => {
  return (
    <>
      <DataTable<Person> data={generateSampleData(100)} columns={columns} defaultPageSize={5} />
      <br />
      <DataTable<Person> data={generateSampleData(100)} columns={columnsWithoutLabel} />
      <br />
      <DataTable<Person> data={generateSampleData(100)} />
      <br />
      <DataTable<Person> data={generateSampleData(100)} columns={columnsWithEmptyLabel} />
    </>
  );
  return;
});
