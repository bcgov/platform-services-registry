'use client';

import ResourceAreaLayout from '@/components/resources/ResourceAreaLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ResourceAreaLayout
      context="public"
      title="Public Cloud Landing Zone"
      description="Browse the public cloud landing zone products and requests without the legacy top-level tab shell."
      basePath="/resources/public-cloud-landing-zone"
    >
      {children}
    </ResourceAreaLayout>
  );
}
