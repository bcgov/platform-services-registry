'use client';

import { Timeline, Text, Divider } from '@mantine/core';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import _startCase from 'lodash-es/startCase';
import _toLower from 'lodash-es/toLower';
import ExternalLink from '@/components/generic/button/ExternalLink';
import TimeAgo from '@/components/generic/TimeAgo';
import UserCard from '@/components/UserCard';
import { RequestType } from '@/prisma/client';
import { MembersHistoryItem } from '@/types/public-cloud';

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

export default function MembersHistory({ membersRoles }: { membersRoles: MembersHistoryItem[] | undefined }) {
  if (!membersRoles || membersRoles.length === 0) return null;

  return (
    <div className="flex justify-center items-center">
      <Timeline active={membersRoles.length} color="green" bulletSize={28} lineWidth={3} className="max-w-3xl">
        {membersRoles.map((request) => {
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

                const hasNewRoles = newRoles.length > 0;
                const hasPrevRoles = prevRoles.length > 0;

                let message = '';

                if (!hasNewRoles && !hasPrevRoles) {
                  message = 'has been updated as a member with roles [] from previous roles []';
                } else if (hasNewRoles && !hasPrevRoles) {
                  message =
                    newRoles.length > 0
                      ? `has been assigned to ${newRoles.join(', ')}`
                      : 'has been assigned as a member with roles []';
                } else if (!hasNewRoles && hasPrevRoles) {
                  message =
                    prevRoles.length > 0
                      ? `has been unassigned from ${prevRoles.join(', ')}`
                      : 'has been unassigned from roles []';
                } else {
                  message = `has been updated as a member with roles ${newRoles.join(
                    ', ',
                  )} from previous roles ${prevRoles.join(', ')}`;
                }

                return (
                  <div key={request.request.id} className="mb-2">
                    <Text c="dimmed" size="sm" className="flex flex-col gap-1">
                      <UserCard user={item} classNames={{ name: 'text-sm' }} />
                      <span>{message} </span>
                    </Text>
                    <Divider my="xs" />
                  </div>
                );
              })}
              <TimeAgo date={request.request.date} />
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
}
