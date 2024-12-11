'use client';
import { IconMail } from '@tabler/icons-react';
import { cn } from '@/utils/js';

export default function MailLink({
  to,
  className = '',
  children,
}: {
  to: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const href = `mailto:${to}`;

  return (
    <a
      href={href}
      className={cn('underline text-blue-500 hover:text-blue-700', className)}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <IconMail className="mr-[1px] h-4 w-4 inline-block" aria-hidden="true" />
      {children ?? to}
    </a>
  );
}
