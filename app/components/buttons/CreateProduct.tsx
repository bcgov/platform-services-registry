import { Button } from '@mantine/core';
import { IconCirclePlus } from '@tabler/icons-react';
import Link from 'next/link';

export default function CreateProduct({ context }: { context: 'private' | 'public' }) {
  return (
    <Button component={Link} href={`/${context}-cloud/products/create`} leftSection={<IconCirclePlus />}>
      Request a new product
    </Button>
  );
}
