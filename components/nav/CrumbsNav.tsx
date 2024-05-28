import { IconChevronRight, IconCopy, IconArrowBack } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { copyToClipboard } from '@/utils/copy-to-clipboard';
import { showTooltip } from '@/utils/show-tooltip';

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
          <div className="text-xl text-cloudgrey mr-4">{cloudLabel}</div>
        </li>
        <li>
          <Link className="ml-4 mr-2" type="button" href={`/${backUrl}/products/all`}>
            <IconArrowBack className="inline-block" />
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <div className="ml-1 text-gray-400  text-lg font-medium">{previousLabel}</div>
          </div>
        </li>
        {licencePlate && licencePlate !== 'create' && (
          <li>
            <div className="flex items-center">
              <IconChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <div className="flex ml-2 text-gray-400 text-lg font-medium">{licencePlate}</div>
              <IconCopy
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
