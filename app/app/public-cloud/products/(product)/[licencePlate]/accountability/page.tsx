'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { GlobalRole } from '@/constants';
import createClientPage from '@/core/client-page';

const publicCloudAccountabilityRedirect = createClientPage({
  roles: [GlobalRole.User],
});

export default publicCloudAccountabilityRedirect(() => {
  const params = useParams();
  const router = useRouter();
  const licencePlate = (params?.licencePlate as string) ?? '';

  useEffect(() => {
    if (licencePlate) {
      router.replace(`/public-cloud/products/${licencePlate}/edit`);
    }
  }, [licencePlate, router]);

  return null;
});
