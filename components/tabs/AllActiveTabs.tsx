'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from '../utils/classnames';

export default function Tabs() {
  const pathname = usePathname();

  const selectedTab = pathname.split('/')[3];
  const isProducts = pathname.split('/')[2] === 'products';

  console.log(selectedTab);

  if (!isProducts) {
    return null;
  }

  return (
    <span className="isolate inline-flex rounded-md shadow-sm m-1">
      <Link
        href={`/${pathname.split('/')[1]}/products/all`}
        type="button"
        className={classNames(
          'w-24 relative inline-flex justify-center items-center rounded-l-lg px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10',
          selectedTab === 'all' ? 'bg-gray-200 hover:bg-gray-200' : 'bg-white',
        )}
      >
        View All
      </Link>

      <Link
        href={`/${pathname.split('/')[1]}/products/active-requests`}
        type="button"
        className={classNames(
          'w-28 relative -ml-px inline-flex justify-center items-center rounded-r-lg  px-3.5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10',
          selectedTab === 'active-requests' ? 'bg-gray-200 hover:bg-gray-200' : 'bg-white',
        )}
      >
        In Progress
      </Link>
    </span>
  );
}

// export default function Tabs() {
//   const pathname = usePathname();

//   return (
//     <span className="isolate inline-flex rounded-md h-10">
//       <Link
//         style={{ width: 97 }}
//         type="button"
//         href={`/${pathname.split('/')[1]}/products`}
//         className={`pl-4 relative inline-flex items-center rounded-l-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-bcblue focus:z-10
//           ${
//             pathname.split('/')[2] === 'products' ? 'bg-bcblue text-white' : 'bg-white text-gray-900 hover:bg-gray-100'
//           }`}
//       >
//         Active
//       </Link>
//       <Link
//         style={{ width: 97 }}
//         type="button"
//         href={`/${pathname.split('/')[1]}/requests`}
//         className={`pl-5 relative -ml-px inline-flex items-center rounded-r-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-bcblue focus:z-10
//           ${
//             pathname.split('/')[2] === 'requests' ? 'bg-bcblue text-white' : 'bg-white text-gray-900 hover:bg-gray-100'
//           }`}
//       >
//         All
//       </Link>
//     </span>
//   );
// }
