'use client';

import RegistryDashboard from '@/components/dashboard/RegistryDashboard';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

const home = createClientPage({
  roles: [GlobalRole.User],
  fallbackUrl: '/login',
});

export default home(() => <RegistryDashboard />);
