'use client';

export default function TableFooter({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 border-t border-gray-200">{children}</div>
    </>
  );
}
