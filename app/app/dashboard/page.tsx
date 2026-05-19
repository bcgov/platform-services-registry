'use client';

import RegistryDashboard from '@/components/dashboard/RegistryDashboard';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

const dashboardPage = createClientPage({
  roles: [GlobalRole.User],
  fallbackUrl: '/login?callbackUrl=/dashboard',
});

export default dashboardPage(() => {
  return <RegistryDashboard />;
});
