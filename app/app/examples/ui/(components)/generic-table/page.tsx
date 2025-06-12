'use client';

import GenericTable from '@/components/generic/table/GenericTable';
import { GlobalRole } from '@/constants/user';
import createClientPage from '@/core/client-page';

const sampleData = [
  { firstName: 'Adebayo', lastName: 'Ogunlesi', age: 42, occupation: 'Software Engineer' },
  { firstName: 'Chioma', lastName: 'Eze', age: 28, occupation: 'Medical Doctor' },
  { firstName: 'Olumide', lastName: 'Adeleke', age: 35, occupation: 'Bank Manager' },
  { firstName: 'Amina', lastName: 'Mohammed', age: 31, occupation: 'Teacher' },
  { firstName: 'Emeka', lastName: 'Okafor', age: 45, occupation: 'Business Owner' },
  { firstName: 'Folake', lastName: 'Balogun', age: 26, occupation: 'Graphic Designer' },
  { firstName: 'Ibrahim', lastName: 'Musa', age: 39, occupation: 'Civil Engineer' },
];

const Page = createClientPage({
  roles: [GlobalRole.User],
});

export default Page(() => {
  return <GenericTable data={sampleData} />;
});
