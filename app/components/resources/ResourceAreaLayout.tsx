'use client';

import { usePathname } from 'next/navigation';
import CreateProduct from '@/components/buttons/CreateProduct';
import EntityPageHeader from '@/components/system/EntityPageHeader';

export default function ResourceAreaLayout({
  children,
  context,
  title,
  description,
  basePath,
}: {
  readonly children: React.ReactNode;
  readonly context: 'private' | 'public';
  readonly title: string;
  readonly description: string;
  readonly basePath: string;
}) {
  const pathname = usePathname();
  const shouldRenderSectionChrome =
    pathname === basePath || pathname === `${basePath}/products/all` || pathname === `${basePath}/requests/all`;

  if (!shouldRenderSectionChrome) {
    return <div className="pt-5">{children}</div>;
  }

  return (
    <div className="pt-5 space-y-4">
      <EntityPageHeader
        breadcrumbs={[
          { label: 'Dashboard', href: '/home' },
          { label: 'Resources', href: '/resources' },
          { label: title },
        ]}
        title={title}
        description={description}
        actions={<CreateProduct context={context} />}
      />
      {children}
    </div>
  );
}
