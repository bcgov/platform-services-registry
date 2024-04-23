import Image from 'next/image';
import Arrow from '@/components/assets/arrow.svg';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRightIcon } from '@heroicons/react/20/solid';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { copyToClipboard } from '@/utils/copy-to-clipboard';
import { showTooltip } from '@/utils/show-tooltip';
import Link from 'next/link';

export default function CrumbsNav({ cloudLabel, previousLabel }: { cloudLabel: string; previousLabel?: string }) {
  const pathname = usePathname();
  const licencePlate = pathname.split('/')[3];
  const backUrl = pathname.split('/')[1];
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const handleCopyToClipboard = (licencePlateToCopy: string) => {
    copyToClipboard(licencePlateToCopy);
    showTooltip(setTooltipVisible);
  };

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
        {licencePlate && licencePlate !== 'create' && (
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <div className="flex ml-2 text-gray-400 font-bcsans text-lg font-medium">{licencePlate}</div>
              <DocumentDuplicateIcon
                className="h-5 w-5 flex-none text-gray-400 cursor-pointer hover:bg-gray-50"
                aria-hidden="true"
                onClick={() => handleCopyToClipboard(licencePlate)}
              />
              {tooltipVisible && (
                <div
                  data-tooltip-placement="right-end"
                  className="flex opacity-70 z-50 bg-white text-gray-600 py-1 px-2 rounded-lg text-sm shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none"
                >
                  Copied
                </div>
              )}
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
}
