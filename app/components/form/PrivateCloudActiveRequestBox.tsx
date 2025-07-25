import { Tooltip, Badge, Indicator } from '@mantine/core';
import {
  IconHourglass,
  IconPencil,
  IconTrash,
  IconFilePlus,
  IconConfetti,
  IconCircleCheck,
  IconPoint,
  IconBan,
  IconCancel,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { RequestType, DecisionStatus } from '@/prisma/client';
import { getPrivateCloudCommentCount } from '@/services/backend/private-cloud/products';
import { PrivateCloudRequestDetail } from '@/types/private-cloud';
import { cn } from '@/utils/js';

export default function PrivateCloudActiveRequestBox({
  request,
  className,
  showCount = false,
}: {
  request: Pick<
    PrivateCloudRequestDetail,
    'id' | 'licencePlate' | 'active' | 'actioned' | 'type' | 'decisionStatus' | 'createdBy'
  >;
  className?: string;
  showCount?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const canViewComments = session?.permissions?.viewAllPrivateProductComments;
  const displayCommentCount = showCount && canViewComments;

  const { data: commentData, isLoading } = useQuery({
    queryKey: ['commentCount', request.id],
    queryFn: () => getPrivateCloudCommentCount(request.licencePlate, request.id),
    enabled: displayCommentCount,
  });

  const commentCount = commentData?.count ?? 0;

  let path = 'summary';

  switch (request.type) {
    case RequestType.CREATE:
    case RequestType.EDIT:
    case RequestType.DELETE:
      path = 'decision';
      break;
  }

  let typeColor = 'gray';
  let TypeIcon = IconPoint;

  switch (request.type) {
    case RequestType.CREATE:
      typeColor = 'green';
      TypeIcon = IconFilePlus;
      break;
    case RequestType.EDIT:
      typeColor = 'blue';
      TypeIcon = IconPencil;
      break;
    case RequestType.DELETE:
      typeColor = 'red';
      TypeIcon = IconTrash;
      break;
  }

  let decisionColor = 'gray';
  let decisionText = '';
  let DecisionIcon = IconPoint;

  switch (request.decisionStatus) {
    case DecisionStatus.PENDING:
      if (request.actioned) {
        decisionColor = 'blue';
        decisionText = 'Reviewing';
      } else {
        decisionColor = 'gray';
        decisionText = 'Submitted';
      }
      DecisionIcon = IconHourglass;
      break;
    case DecisionStatus.APPROVED:
      decisionColor = 'lime';
      decisionText = 'Approved';
      DecisionIcon = IconConfetti;
      break;
    case DecisionStatus.AUTO_APPROVED:
      decisionColor = 'lime';
      decisionText = 'Auto-Approved';
      DecisionIcon = IconConfetti;
      break;
    case DecisionStatus.REJECTED:
      decisionColor = 'red';
      decisionText = 'Rejected';
      DecisionIcon = IconBan;
      break;
    case DecisionStatus.PARTIALLY_PROVISIONED:
      decisionColor = 'lime';
      decisionText = 'Partially Provisioned';
      DecisionIcon = IconConfetti;
      break;
    case DecisionStatus.PROVISIONED:
      decisionColor = 'green';
      decisionText = 'Provisioned';
      DecisionIcon = IconCircleCheck;
      break;
    case DecisionStatus.CANCELLED:
      decisionColor = 'pink';
      decisionText = 'Cancelled';
      DecisionIcon = IconCancel;
      break;
  }

  const badges = (
    <>
      <Badge
        leftSection={<DecisionIcon className="h-6 w-6" />}
        color={decisionColor}
        size="lg"
        radius="sm"
        autoContrast
        className="min-w-40 m-auto flex"
      >
        {decisionText}
      </Badge>
    </>
  );

  return (
    <Tooltip label="View Request" position="top" offset={10}>
      <button
        type="button"
        className={cn(
          className,
          'w-full max-w-sm relative text-gray-900 bg-white border-solid border-2 border-gray-300 focus:outline-hidden hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-2.5',
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/private-cloud/requests/${request.id}/${path}`);
        }}
      >
        <div className="relative">
          {displayCommentCount && commentCount > 0 && (
            <Badge
              color="blue"
              size="md"
              circle
              className="absolute top-1 left-0 transform -translate-x-1/2 -translate-y-1/2"
            >
              {commentCount}
            </Badge>
          )}
          <Indicator color={request.active ? 'lime' : 'red'} zIndex={10}>
            <Badge
              autoContrast
              leftSection={<TypeIcon />}
              size="lg"
              radius="sm"
              color="rgba(200, 200, 200, 1)"
              className="mb-1 min-w-40 m-auto flex"
            >
              {request.type}
            </Badge>
          </Indicator>
        </div>
        <div>{badges}</div>
        {request.createdBy?.email && (
          <div className="text-center text-sm text-gray-400">
            Submitted by <span className="font-bold block">{request.createdBy.email}</span>
          </div>
        )}
      </button>
    </Tooltip>
  );
}
