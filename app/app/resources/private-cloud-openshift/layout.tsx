'use client';

import ResourceAreaLayout from '@/components/resources/ResourceAreaLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ResourceAreaLayout
      context="private"
      title="Private Cloud OpenShift"
      description="Browse the private cloud OpenShift products and requests without the legacy top-level tab shell."
      basePath="/resources/private-cloud-openshift"
    >
      {children}
    </ResourceAreaLayout>
  );
}
