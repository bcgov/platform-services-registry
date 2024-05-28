'use client';

import DashboardLayout from '@/components/layouts/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout context="public">{children}</DashboardLayout>;
}
