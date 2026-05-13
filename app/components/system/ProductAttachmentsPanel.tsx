'use client';

import { Card, Loader } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  getPrivateCloudProductAttachments,
  getPublicCloudProductAttachments,
} from '@/services/backend/product-attachments';

export default function ProductAttachmentsPanel({
  context,
  licencePlate,
}: {
  context: 'private' | 'public';
  licencePlate: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['productAttachments', context, licencePlate],
    queryFn: () =>
      context === 'private'
        ? getPrivateCloudProductAttachments(licencePlate)
        : getPublicCloudProductAttachments(licencePlate),
    enabled: !!licencePlate,
  });

  return (
    <Card withBorder mt="md">
      <h3 className="text-lg font-semibold mb-3">Systems and Teams</h3>
      {isLoading && <Loader size="sm" />}
      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="font-medium">Systems</p>
            <ul className="list-disc pl-5">
              {(data?.systems ?? []).map((system) => (
                <li key={system.id}>
                  <Link href={`/systems/${system.id}`} className="underline">
                    {system.name}
                  </Link>
                </li>
              ))}
              {(data?.systems ?? []).length === 0 && <li className="list-none text-gray-500">No linked systems.</li>}
            </ul>
          </div>
          <div>
            <p className="font-medium">Teams</p>
            <ul className="list-disc pl-5">
              {(data?.teams ?? []).map((team) => (
                <li key={team.id}>
                  <Link href={`/teams/${team.id}`} className="underline">
                    {team.name}
                  </Link>
                </li>
              ))}
              {(data?.teams ?? []).length === 0 && <li className="list-none text-gray-500">No linked teams.</li>}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
