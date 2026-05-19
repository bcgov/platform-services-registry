'use client';

import Tabs from '@/components/generic/tabs/BasicTabs';
import Landing from '@/components/Landing';
import { tabs } from '@/components/layouts/DashboardLayout';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

const legacyHome = createClientPage({
  roles: [GlobalRole.User],
  fallbackUrl: '/login?callbackUrl=/legacy-home',
});

export default legacyHome(() => {
  return (
    <div>
      <Tabs tabs={tabs}></Tabs>
      <div className="mt-6">
        <Landing />
      </div>
    </div>
  );
});
