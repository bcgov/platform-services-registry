import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function NavButton({ page, pageSize, label }: { page: number; pageSize: number; label: string }) {
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;

  const disabled = false;

  const onClickHandler = () => {
    const params = new URLSearchParams(searchParams?.toString());

    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());

    push(`${pathname}?${params.toString()}`);
  };

  // const onClickHandler = () => {
  //   pathname: "/dashboard/private-cloud/products",
  //                   query: {
  //                     page: currentPage + 1,
  //                     pageSize: pageSize || defaultPageSize,
  //                     search,
  //                   },

  return (
    <button
      // disabled={disabled}
      onClick={onClickHandler}
      className={`relative ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 ${
        disabled
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-white text-gray-900 hover:bg-gray-50 focus-visible:outline-offset-0'
      })
  }`}
    >
      {label}
    </button>
  );
}
