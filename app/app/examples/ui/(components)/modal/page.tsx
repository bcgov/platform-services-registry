'use client';

import { Button } from '@mantine/core';
import createClientPage from '@/core/client-page';
import { openTestModal } from './testModal';

const modalPage = createClientPage({});
export default modalPage(() => {
  return (
    <>
      <h1 className="font-bold text-2xl mt-4 mb-5">Textarea</h1>
      <Button
        onClick={async () => {
          const result = await openTestModal<{ value: number }>(
            { name: 'Platform Service Team' },
            { snapshot: { value: 1000 } },
          );

          console.log(result);
        }}
      >
        Open Modal
      </Button>
    </>
  );
});
