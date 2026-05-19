'use client';

import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function EntityPageHeader({
  breadcrumbs,
  title,
  description,
  actions,
}: {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-gray-700 hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'font-medium text-gray-700' : undefined}>{item.label}</span>
                )}
                {!isLast && <span className="text-gray-400">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold leading-7 text-gray-900 lg:text-2xl 2xl:text-4xl">{title}</h1>
          {description && <p className="max-w-3xl text-sm text-gray-600 lg:text-base">{description}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
