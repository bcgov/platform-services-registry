'use client';

import DashboardLayout from '@/components/layouts/dashboard';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout context="public">{children}</DashboardLayout>;
}
