import { IconCirclePlus } from '@tabler/icons-react';
import Link from 'next/link';

export default function CreateProduct({ context }: { context: 'private' | 'public' }) {
  return (
    <Link
      className="flex justify-center pr-8 items-center rounded-md bg-bcorange px-4 py-2 h-10 text-bcblue text-base font-light tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm  sm:tracking-[.1em]"
      type="button"
      href={`/${context}-cloud/products/create`}
    >
      <IconCirclePlus size={20} className="mr-2" />
      REQUEST A NEW PRODUCT
    </Link>
  );
}
