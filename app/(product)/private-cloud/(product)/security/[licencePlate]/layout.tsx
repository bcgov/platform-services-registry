'use client';

import { ToastContainer } from 'react-toastify';
import SideTabs from '@/components/generic/SideTabs';

export default function Layout({ params, children }: { params: { licencePlate: string }; children: React.ReactNode }) {
  const { licencePlate } = params;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 md:gap-4 mb-2">
      <div className="col-span-2">
        <SideTabs
          tabs={[
            { value: 'repo', label: 'Repository URLs', href: `/private-cloud/security/${licencePlate}/repository` },
            { value: 'zapscan', label: 'Zap Scan Results', href: `/private-cloud/security/${licencePlate}/zapscan` },
            {
              value: 'sonarscan',
              label: 'Sonar Scan Results',
              href: `/private-cloud/security/${licencePlate}/sonarscan`,
            },
            {
              value: 'acs',
              label: 'ACS Results',
              href: `/private-cloud/security/${licencePlate}/acs`,
            },
          ]}
        />
      </div>
      <div className="col-span-10">{children}</div>
      <ToastContainer />
    </div>
  );
}
