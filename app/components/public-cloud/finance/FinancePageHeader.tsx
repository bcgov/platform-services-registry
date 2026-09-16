'use client';

import FinanceNav from '@/components/public-cloud/finance/FinanceNav';

export default function FinancePageHeader({
  title,
  description,
}: Readonly<{
  title: string;
  description: string;
}>) {
  return (
    <header className="mb-6">
      <h1 className="text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-600 max-w-3xl">{description}</p>
      <div className="mt-4">
        <FinanceNav />
      </div>
    </header>
  );
}
