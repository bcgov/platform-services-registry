'use client';

import { Timeline } from '@mantine/core';
import { IconEdit, IconPlus, IconTrashX } from '@tabler/icons-react';
import _orderBy from 'lodash-es/orderBy';
import { ReactNode } from 'react';
import ExternalLink from '@/components/generic/button/ExternalLink';
import { RequestType } from '@/prisma/client';
import { PrivateCloudRequestSimpleDecorated } from '@/types/private-cloud';
import RequestTimeLine from './RequestTimeLine';

export default function RequestsHistory({ requests }: { requests: PrivateCloudRequestSimpleDecorated[] | undefined }) {
  if (!requests) return null;

  const orderedRequests = _orderBy(requests, 'createdAt', 'asc');

  return (
    <>
      <div className="flex justify-center items-center">
        <Timeline active={orderedRequests.length} color="green" bulletSize={28} lineWidth={3} className="max-w-3xl">
          {orderedRequests.map((request) => {
            let bullet!: ReactNode;
            if (request.type === RequestType.CREATE) bullet = <IconPlus size={18} />;
            else if (request.type === RequestType.EDIT) bullet = <IconEdit size={18} />;
            else if (request.type === RequestType.DELETE) bullet = <IconTrashX size={18} />;

            return (
              <Timeline.Item
                key={request.id}
                bullet={bullet}
                title={
                  <div>
                    {request.type}
                    <ExternalLink href={`/private-cloud/requests/${request.id}/summary`} className="ml-2">
                      {request.id}
                    </ExternalLink>
                  </div>
                }
              >
                <RequestTimeLine request={request} />
              </Timeline.Item>
            );
          })}
        </Timeline>
      </div>
    </>
  );
}
