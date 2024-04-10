import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ProductsRequestsTabs() {
  const pathname = usePathname();

  return (
    <span className="isolate inline-flex rounded-md h-10 mb-8">
      <Link
        type="button"
        href={`/${pathname.split('/')[1]}/products/all`}
        className={`w-24 pl-4 relative inline-flex items-center rounded-l-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-bcblue focus:z-10
          ${pathname.split('/')[3] === 'all' ? 'bg-bcblue text-white' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
      >
        Products
      </Link>
      <Link
        type="button"
        href={`/${pathname.split('/')[1]}/products/active-requests`}
        className={`w-28 pl-5 relative -ml-px inline-flex items-center rounded-r-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-bcblue focus:z-10
          ${
            pathname.split('/')[3] === 'active-requests'
              ? 'bg-bcblue text-white'
              : 'bg-white text-gray-900 hover:bg-gray-100'
          }`}
      >
        In Progress
      </Link>
    </span>
  );
}
