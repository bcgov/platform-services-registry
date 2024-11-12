'use client';

import { IconExternalLink } from '@tabler/icons-react';
import { cn } from '@/utils';

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
      className={cn('underline text-blue-500 hover:text-blue-700', className)}
      rel="noopener noreferrer"
    >
      {children}
      <IconExternalLink className="inline-block" />
    </a>
  );
}
