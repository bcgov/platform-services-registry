'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/public-cloud/finance', label: 'Snapshot', exact: true },
  { href: '/public-cloud/finance/rankings', label: 'Rankings' },
  { href: '/public-cloud/finance/coverage', label: 'Coverage (internal)' },
  { href: '/public-cloud/finance/anomalies', label: 'Anomalies (internal)' },
  { href: '/public-cloud/finance/unmatched', label: 'Unmatched (internal)' },
  { href: '/public-cloud/finance/export', label: 'Export' },
];

export default function FinanceNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Finance views" className="flex flex-wrap gap-2 mb-6">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 text-sm border ${
              active ? 'bg-bcblue text-white border-bcblue' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
