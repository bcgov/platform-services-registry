'use client';

import classnames from 'classnames';
import { EnvelopeIcon } from '@heroicons/react/20/solid';

export default function MailLink({
  to,
  className = '',
  children,
}: {
  to: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a href={`mailto:${to}`} className={classnames('underline text-blue-500 hover:text-blue-700', className)}>
      <EnvelopeIcon className="mr-1 h-4 w-4 inline-block" aria-hidden="true" />
      {children ?? to}
    </a>
  );
}
