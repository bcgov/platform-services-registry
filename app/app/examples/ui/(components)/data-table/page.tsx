'use client';

import _startCase from 'lodash-es/startCase';
import DataTable from '@/components/generic/table/DataTable';
import { GlobalRole } from '@/constants/user';
import createClientPage from '@/core/client-page';

const sampleData = [
  { firstName: 'adebayo', lastName: 'ogunlesi', age: 42, occupation: 'Software Engineer' },
  { firstName: 'Chioma', lastName: 'Eze', age: 28, occupation: 'Medical Doctor' },
  { firstName: 'Olumide', lastName: 'Adeleke', age: 35, occupation: 'Bank Manager' },
  { firstName: 'Amina', lastName: 'Mohammed', age: 31, occupation: 'Teacher' },
  { firstName: 'adebayo', lastName: 'ogunlesi', age: 42, occupation: 'Software Engineer' },
  { firstName: 'Chioma', lastName: 'Eze', age: 28, occupation: 'Medical Doctor' },
  { firstName: 'Olumide', lastName: 'Adeleke', age: 35, occupation: 'Bank Manager' },
  { firstName: 'Amina', lastName: 'Mohammed', age: 31, occupation: 'Teacher' },
  { firstName: 'adebayo', lastName: 'ogunlesi', age: 42, occupation: 'Software Engineer' },
  { firstName: 'Chioma', lastName: 'Eze', age: 28, occupation: 'Medical Doctor' },
];

const columns = [
  { label: 'First Name', value: 'firstName', cellProcessor: (item) => _startCase(item.firstName) },
  { label: 'Last Name', value: 'lastName', cellProcessor: (item) => _startCase(item.lastName) },
  { label: 'Age', value: 'age' },
  { label: 'Occupation', value: 'occupation' },
];

const Page = createClientPage({
  roles: [GlobalRole.User],
});

export default Page(() => {
  return (
    <>
      <DataTable data={sampleData} columns={columns} defaultPageSize={5} />;
    </>
  );
});
