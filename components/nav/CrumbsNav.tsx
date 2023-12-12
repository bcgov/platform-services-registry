'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Arrow from '@/components/assets/arrow.svg';
import Link from 'next/link';

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

  return (
    <div className="">
      <div className="flex h-16 justify-left items-center">
        <div className="font-bcsans text-xl text-cloudgrey ">{cloudLabel}</div>
        <div className="border-l h-12 border-divider mx-5"></div>{' '}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center">
            <li>
              <button onClick={() => router.back()}>
                <Image
                  alt="Arrow"
                  src={Arrow}
                  width={20}
                  height={20}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                />
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <span className="ml-4 font-bcsans text-lg font-medium text-gray-500 mb-0.5">{previousLabel}</span>
                {currentLabel && (
                  <svg
                    className="h-3 w-3 flex-shrink-0 text-gray-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                  </svg>
                )}
              </div>
            </li>
            <li>
              <div className="flex items-center font-bcsans text-xl">{currentLabel}</div>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
