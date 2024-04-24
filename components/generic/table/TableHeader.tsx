'use client';

export default function TableTop({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6 border-b-2">
        <div className="sm:flex sm:items-center pb-5">
          <div className="sm:flex-auto">
            <h1 className="text-lg font-bcsans font-bold leading-6 text-gray-900">{title}</h1>
            <p className="mt-2 text-sm font-bcsans text-gray-700">{description}</p>
          </div>
        </div>
      </div>
      {children && <div className="flex justify-between items-center border-b-2 px-4 py-2 w-full">{children}</div>}
    </>
  );
}
