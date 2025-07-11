'use client';

import { Timeline, Text, Divider } from '@mantine/core';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import ExternalLink from '@/components/generic/button/ExternalLink';
import UserCard from '@/components/UserCard';
import { formatRole, getRoleChangeMessage } from '@/helpers/members';
import { RequestType } from '@/prisma/client';
import { MembersHistoryResponse } from '@/services/db/members-history';
import { formatDateSimple } from '@/utils/js/date';

export default function MembersHistory({ membersRoles }: { membersRoles: MembersHistoryResponse | undefined }) {
  if (!membersRoles || membersRoles.requests.length === 0) return null;

  return (
    <div className="flex justify-center items-center">
      <Timeline active={membersRoles.requests.length} color="green" bulletSize={28} lineWidth={3} className="max-w-3xl">
        {membersRoles.requests.map((request) => {
          const bullet = request.request.type === RequestType.CREATE ? <IconPlus size={18} /> : <IconEdit size={18} />;

          return (
            <Timeline.Item
              key={request.request.id}
              bullet={bullet}
              title={
                <div>
                  {request.request.type}
                  <ExternalLink href={`/public-cloud/requests/${request.request.id}/summary`} className="ml-2">
                    {request.request.id}
                  </ExternalLink>
                </div>
              }
            >
              {request.items.map((item) => {
                const newRoles = item.newRoles.map(formatRole);
                const prevRoles = item.prevRoles.map(formatRole);
                const user = membersRoles.users.find((u) => u.id === item.userId);
                const message = getRoleChangeMessage(prevRoles, newRoles);

                return (
                  <div key={`${request.request.id}-${item.userId}`} className="mb-2">
                    <Text size="sm" className="flex flex-col gap-1">
                      <UserCard user={user} classNames={{ name: 'text-sm' }} />
                      <span>{message}</span>
                    </Text>
                    <Divider my="xs" />
                  </div>
                );
              })}
              <Text c="dimmed" size="sm">
                {formatDateSimple(request.request.date)}
              </Text>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
}
