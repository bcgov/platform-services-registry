'use client';

import classnames from 'classnames';

export default function ExternalLink({
  href,
  className = '',
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      className={classnames('underline text-blue-500 hover:text-blue-700', className)}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}
