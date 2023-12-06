import Image from 'next/image';
import Arrow from '@/components/assets/arrow.svg';
import Link from 'next/link';

export default function CrumbsNav({
  backUrl,
  cloudLabel,
  previousLabel,
  currentLabel,
}: {
  backUrl: string;
  cloudLabel: string;
  previousLabel?: string;
  currentLabel?: string;
}) {
  return (
    <div className="">
      <div className="flex h-16 justify-left items-center">
        <div className="font-bcsans text-2xl text-cloudgrey ">{cloudLabel}</div>
        <div className="border-l h-12 border-divider mx-5"></div>{' '}
        {/* Adjust the height (h-20) and color (border-gray-500) as needed */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center ">
            <li>
              <div>
                <Link href={backUrl}>
                  <Image
                    alt="Arrow"
                    src={Arrow}
                    width={25}
                    height={25}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="ml-4 font-bcsans text-xl font-medium text-gray-500">{previousLabel}</span>
                {currentLabel && (
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-300"
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
