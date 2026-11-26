'use client';

import { useParams } from 'next/navigation';
import AiUsageReports from '@/components/fabric/AiUsageReports';

export default function AiUsagePage() {
  const { licencePlate } = useParams<{ licencePlate: string }>();
  return <AiUsageReports cloud="public" licencePlate={licencePlate} />;
}
