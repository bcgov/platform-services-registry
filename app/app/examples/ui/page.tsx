'use client';

import Link from 'next/link';
import createClientPage from '@/core/client-page';

interface PageProp {
  href: string;
  label: string;
}

const pages = [
  {
    href: 'ui/button',
    label: 'Button',
  },
  {
    href: 'ui/text-input',
    label: 'Text Input',
  },
  {
    href: 'ui/textarea',
    label: 'Textarea',
  },
  {
    href: 'ui/multi-select',
    label: 'Multi Select',
  },
  {
    href: 'ui/table',
    label: 'Table',
  },
];

function PageItem({ href, label }: PageProp) {
  return (
    <li className="mb-2">
      <Link
        href={href}
        className="text-blue-600 hover:underline visited:text-purple-600 font-bold text-lg transition duration-200 ease-in-out px-2"
      >
        {label}
      </Link>
    </li>
  );
}

const Page = createClientPage({
  roles: ['user'],
});
export default Page(() => {
  return (
    <>
      <h1 className="font-bold text-2xl mt-4 mb-5">UI components</h1>
      <ul className="list-disc pl-5">
        {pages.map((props) => (
          <PageItem {...props} key={props.href} />
        ))}
      </ul>
    </>
  );
});
