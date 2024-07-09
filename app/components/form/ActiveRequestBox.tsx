import { Tooltip, Badge, Indicator } from '@mantine/core';
import { $Enums } from '@prisma/client';
import {
  IconHourglass,
  IconPencil,
  IconTrash,
  IconFilePlus,
  IconConfetti,
  IconCircleCheck,
  IconPoint,
  IconBan,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getCommentCount } from '@/services/backend/private-cloud/products';

export default function ActiveRequestBox({
  data,
  className,
  showCount = false,
}: {
  data?: {
    cloud: 'private-cloud' | 'public-cloud';
    id: string;
    licencePlate: string;
    type: $Enums.RequestType;
    active: boolean;
    decisionStatus: $Enums.DecisionStatus;
    createdByEmail: string;
  };
  className?: string;
  showCount?: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();

  const canViewComments = session?.permissions?.viewAllPrivateProductComments;

  const { data: commentData, isLoading } = useQuery({
    queryKey: ['commentCount', data?.id],
    queryFn: () => getCommentCount(data?.licencePlate as string, data?.id as string),
    enabled: showCount && canViewComments && !!data?.id && !!data?.licencePlate,
  });

  const commentCount = commentData?.count;

  if (!data) return null;

  let path = 'summary';

  if (data.cloud === 'private-cloud') {
    switch (data.type) {
      case $Enums.RequestType.CREATE:
      case $Enums.RequestType.EDIT:
      case $Enums.RequestType.DELETE:
        path = 'decision';
        break;
    }
  } else {
    switch (data.type) {
      case $Enums.RequestType.CREATE:
      case $Enums.RequestType.EDIT:
      case $Enums.RequestType.DELETE:
        path = 'request';
        break;
    }
  }

  let typeColor = 'gray';
  let TypeIcon = IconPoint;

  switch (data.type) {
    case $Enums.RequestType.CREATE:
      typeColor = 'green';
      TypeIcon = IconFilePlus;
      break;
    case $Enums.RequestType.EDIT:
      typeColor = 'blue';
      TypeIcon = IconPencil;
      break;
    case $Enums.RequestType.DELETE:
      typeColor = 'red';
      TypeIcon = IconTrash;
      break;
  }

  let decisionColor = 'gray';
  let decisionText = '';
  let DecisionIcon = IconPoint;

  switch (data.decisionStatus) {
    case $Enums.DecisionStatus.PENDING:
      decisionColor = 'blue';
      decisionText = 'Reviewing';
      DecisionIcon = IconHourglass;
      break;
    case $Enums.DecisionStatus.APPROVED:
      decisionColor = 'lime';
      decisionText = 'Approved';
      DecisionIcon = IconConfetti;
      break;
    case $Enums.DecisionStatus.REJECTED:
      decisionColor = 'red';
      decisionText = 'Rejected';
      DecisionIcon = IconBan;
      break;
    case $Enums.DecisionStatus.PROVISIONED:
      decisionColor = 'green';
      decisionText = 'Provisioned';
      DecisionIcon = IconCircleCheck;
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
        className="ml-1"
      >
        {decisionText}
      </Badge>
    </>
  );

  return (
    <Tooltip label="View Request" position="top" offset={10} className={className}>
      <button
        type="button"
        className="relative text-gray-900 bg-white border-solid border-2 border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/${data.cloud}/requests/${data.id}/${path}`);
        }}
      >
        <div className="relative">
          {showCount && canViewComments && !isLoading && typeof commentCount === 'number' && commentCount > 0 ? (
            <Badge
              color="blue"
              size="md"
              circle
              className="absolute top-1 left-0 transform -translate-x-1/2 -translate-y-1/2"
            >
              {commentCount}
            </Badge>
          ) : null}
          <Indicator color={data.active ? 'lime' : 'red'} zIndex={10}>
            <Badge autoContrast size="xl" color="rgba(200, 200, 200, 1)" radius="md" className="mb-1">
              <TypeIcon className="inline-block" />
              {data.type} Request
            </Badge>
          </Indicator>
        </div>
        <div>{badges}</div>
        {data.createdByEmail && (
          <div className="text-center text-sm text-gray-400">
            Submitted by <span>{data.createdByEmail}</span>
          </div>
        )}
      </button>
    </Tooltip>
  );
}
