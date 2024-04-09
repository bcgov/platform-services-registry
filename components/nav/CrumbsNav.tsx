import Image from 'next/image';
import Arrow from '@/components/assets/arrow.svg';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

export default function CrumbsNav({ cloudLabel, previousLabel }: { cloudLabel: string; previousLabel?: string }) {
  const pathname = usePathname();
  const licencePlate = pathname.split('/')[3];
  const backUrl = pathname.split('/')[1];

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <div className="font-bcsans text-xl text-cloudgrey mr-4">{cloudLabel}</div>
        </li>
        <li>
          <Link className="ml-4 mr-2" type="button" href={`/${backUrl}/products/all`}>
            <Image
              alt="Arrow"
              src={Arrow}
              width={20}
              height={20}
              style={{
                marginTop: '11px',
                maxWidth: '100%',
                height: 'auto',
              }}
            />
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <div className="ml-1 text-gray-400  font-bcsans text-lg font-medium">{previousLabel}</div>
          </div>
        </li>
        {licencePlate && (
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <div className="ml-2 text-gray-400 font-bcsans text-lg font-medium">{licencePlate}</div>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
}
