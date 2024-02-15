'use client';

import ExportButton from '@/components/buttons/ExportButton';
import { Title } from '@tremor/react';

export default function ExportCard({ title, apiEnpoint }: { title: string; apiEnpoint: string }) {
  return (
    <div className="flex flex-col items-end border rounded-lg w-fit p-4">
      <div>
        <Title>{title}</Title>
        <ExportButton className="mt-3 " apiEnpoint={apiEnpoint} />
      </div>
    </div>
  );
}
