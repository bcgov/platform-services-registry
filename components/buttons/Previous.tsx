'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function Previous() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <button
      className="px-12 rounded-md bg-white tracking-[.2em] py-2.5 text-sm font-bcsans text-bcblue shadow-sm ring-1 ring-inset ring-bcblue hover:bg-gray-50"
      type="button"
      onClick={() => router.back()}
    >
      PREVIOUS
    </button>
  );
}
