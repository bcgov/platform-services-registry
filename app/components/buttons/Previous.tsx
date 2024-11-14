import { Button } from '@mantine/core';
import { useRouter } from 'next/navigation';

export default function Previous() {
  const router = useRouter();

  return (
    <Button color="secondary" variant="outline" onClick={() => router.back()}>
      Previous
    </Button>
  );
}
