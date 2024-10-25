'use client';

import { useEffect, useState } from 'react';
import SideTabs from '@/components/generic/tabs/SideTabs';

export default function Layout({
  params: getParams,
  children,
}: {
  params: Promise<{ licencePlate: string }>;
  children: React.ReactNode;
}) {
  const [params, setParams] = useState<{ licencePlate: string }>({ licencePlate: '' });
  const { licencePlate } = params;

  useEffect(() => {
    getParams.then((v) => setParams(v));
  }, [getParams]);

  if (!licencePlate) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 md:gap-4 mb-2">
      <div className="col-span-2">
        <SideTabs
          tabs={[
            {
              value: 'repo',
              label: 'Repository URLs',
              href: `/private-cloud/products/${licencePlate}/security/repository`,
            },
            {
              value: 'zapscan',
              label: 'Zap scan results',
              href: `/private-cloud/products/${licencePlate}/security/zapscan`,
            },
            {
              value: 'sonarscan',
              label: 'Sonar scan results',
              href: `/private-cloud/products/${licencePlate}/security/sonarscan`,
            },
            {
              value: 'acs',
              label: 'ACS results',
              href: `/private-cloud/products/${licencePlate}/security/acs`,
            },
          ]}
        />
      </div>
      <div className="col-span-10">{children}</div>
    </div>
  );
}
