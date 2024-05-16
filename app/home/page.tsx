'use client';

import Tabs from '@/components/generic/tabs/BasicTabs';
import Landing from '@/components/Landing';
import { tabs } from '@/components/layouts/dashboard';

export default function Home() {
  return (
    <div>
      <Tabs tabs={tabs}></Tabs>
      <div className="mt-6">
        <Landing />
      </div>
    </div>
  );
}
