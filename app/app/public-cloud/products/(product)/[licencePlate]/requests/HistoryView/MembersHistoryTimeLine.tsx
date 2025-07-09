'use client';

import { Timeline, Text, Divider } from '@mantine/core';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import _startCase from 'lodash-es/startCase';
import _toLower from 'lodash-es/toLower';
import ExternalLink from '@/components/generic/button/ExternalLink';
import UserCard from '@/components/UserCard';
import { RequestType } from '@/prisma/client';
import { MembersHistoryResponse } from '@/services/db/members-history';
import { formatDateSimple } from '@/utils/js/date';

const knownRoles: Record<string, string> = {
  projectOwner: 'Project Owner',
  primaryTechnicalLead: 'Primary Technical Lead',
  secondaryTechnicalLead: 'Secondary Technical Lead',
  expenseAuthority: 'Expense Authority',
  editor: 'Editor',
  viewer: 'Viewer',
  subscriber: 'Subscriber',
  billingViewer: 'Billing Viewer',
};

const formatRole = (role: string) => {
  const normalized = role.replace(/[^a-zA-Z]/g, '').toLowerCase();
  const matched = Object.entries(knownRoles).find(([key]) => key.toLowerCase() === normalized);
  return matched ? matched[1] : _startCase(_toLower(role));
};

const getRoleChangeMessage = (prevRoles: string[], newRoles: string[]) => {
  const hasNew = newRoles.length > 0;
  const hasPrev = prevRoles.length > 0;

  if (!hasNew && !hasPrev) {
    return 'has been updated as a member with roles [] from previous roles []';
  }

  if (hasNew && !hasPrev) {
    return `has been assigned to ${newRoles.join(', ')}`;
  }

  if (!hasNew && hasPrev) {
    return `has been unassigned from ${prevRoles.join(', ')}`;
  }

  return `has been added as a member with roles: ${newRoles.join(', ')} from previous roles: ${prevRoles.join(', ')}`;
};

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
