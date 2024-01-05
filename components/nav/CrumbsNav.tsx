'use client';

import Image from 'next/image';
import Arrow from '@/components/assets/arrow.svg';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

const pages = [
  { name: 'Projects', href: '#', current: false },
  { name: 'Project Nero', href: '#', current: true },
];

export default function CrumbsNav({
  cloudLabel,
  previousLabel,
  currentLabel,
}: {
  cloudLabel: string;
  previousLabel?: string;
  currentLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const licencePlate = pathname.split('/')[3];

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <div className="font-bcsans text-xl text-cloudgrey mr-4">{cloudLabel}</div>
        </li>
        <li>
          <button onClick={() => router.back()} className="ml-4">
            <Image
              alt="Arrow"
              src={Arrow}
              width={20}
              height={20}
              style={{
                marginTop: '7.5px',
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </button>
        </li>
        {/* <li>
          <div className="flex items-center">
            <div className="ml-1 text-gray-400  font-bcsans text-lg font-medium">{previousLabel}</div>
          </div>
        </li> */}
        {licencePlate && (
          <li>
            <div className="flex items-center">
              {/* <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" /> */}
              <div className="ml-2 text-gray-400 font-bcsans text-lg font-medium">{licencePlate}</div>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
}
