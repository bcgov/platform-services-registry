'use client';

import { Timeline } from '@mantine/core';
import { IconEdit, IconPlus, IconTrashX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import _orderBy from 'lodash-es/orderBy';
import { ReactNode } from 'react';
import ExternalLink from '@/components/generic/button/ExternalLink';
import { RequestType } from '@/prisma/client';
import { getPrivateCloudProductRequests } from '@/services/backend/private-cloud/products';
import RequestTimeLine from './RequestTimeLine';

export default function HistoryView({ licencePlate }: { licencePlate: string }) {
  const {
    data: requests,
    isLoading: requestsLoading,
    isError: requestsIsError,
    error: requestsError,
  } = useQuery({
    queryKey: ['requests', licencePlate],
    queryFn: () => getPrivateCloudProductRequests(licencePlate),
    enabled: !!licencePlate,
  });

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
