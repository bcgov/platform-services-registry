'use client';

import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      <Link
        href="/examples/ui"
        className="text-blue-600 underline visited:text-purple-600 font-bold text-lg transition duration-200 ease-in-out"
      >
        Components
      </Link>
      {children}
    </div>
  );
}
