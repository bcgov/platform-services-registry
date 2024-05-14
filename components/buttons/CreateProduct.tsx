import Image from 'next/image';
import Link from 'next/link';
import Plus from '@/components/assets/plus.svg';

export default function CreateProduct({ context }: { context: 'private' | 'public' }) {
  return (
    <Link
      className="flex justify-center pr-8 items-center rounded-md bg-bcorange px-4 py-2 h-10 text-bcblue text-base font-light tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm  sm:tracking-[.1em]"
      type="button"
      href={`/${context}-cloud/products/create`}
    >
      <Image src={Plus} alt="plus" width={20} height={20} className="mr-4 mt-[3px]" />
      REQUEST A NEW PRODUCT
    </Link>
  );
}
