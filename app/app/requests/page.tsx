'use client';

import PrivateCloudRequestsPage from '@/app/private-cloud/requests/all/page';
import PublicCloudRequestsPage from '@/app/public-cloud/requests/all/page';
import EntityPageHeader from '@/components/system/EntityPageHeader';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

const requestsPage = createClientPage({
  roles: [GlobalRole.User],
  fallbackUrl: '/login?callbackUrl=/requests',
});

export default requestsPage(() => {
  return (
    <div className="space-y-8 pt-5">
      <EntityPageHeader
        breadcrumbs={[{ label: 'Dashboard', href: '/home' }, { label: 'Requests' }]}
        title="Requests"
        description="Review the current private-cloud and public-cloud request queues from a single page."
      />

      <div className="space-y-10">
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900">Private Cloud Requests</h2>
            <p className="text-sm text-gray-600">Current requests for Private Cloud OpenShift products.</p>
          </div>
          <PrivateCloudRequestsPage />
        </section>

        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900">Public Cloud Requests</h2>
            <p className="text-sm text-gray-600">Current requests for Public Cloud Landing Zone products.</p>
          </div>
          <PublicCloudRequestsPage />
        </section>
      </div>
    </div>
  );
});
