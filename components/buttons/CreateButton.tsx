'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Plus from '@/components/assets/plus.svg';

export default function Tabs() {
  const pathname = usePathname();

  if (!pathname) return null;

  return (
    <Link
      className="flex justify-center pr-2 items-center mr-20 rounded-md bg-bcorange px-4 py-2 h-10 font-bcsans text-bcblue text-base font-light tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:text-sm sm:px-3 sm:tracking-[.1em]"
      type="button"
      href={`/${pathname.split('/')[1]}/create`}
    >
      <Image src={Plus} alt="plus" width={20} height={20} className="mr-2" />
      REQUEST A NEW PROJECT SET
    </Link>
  );
}
