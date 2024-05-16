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
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function ActiveRequestBox({
  data,
  className,
}: {
  data?: {
    cloud: 'private-cloud' | 'public-cloud';
    id: string;
    type: $Enums.RequestType;
    active: boolean;
    decisionStatus: $Enums.DecisionStatus;
    createdByEmail: string;
  };
  className?: string;
}) {
  const router = useRouter();

  if (!data) return null;

  let path = 'summary';

  if (data.cloud === 'private-cloud') {
    switch (data.type) {
      case $Enums.RequestType.CREATE:
        path = 'decision';
        break;
      case $Enums.RequestType.EDIT:
        path = 'decision';
        break;
      case $Enums.RequestType.DELETE:
        path = 'decision';
        break;
    }
  } else {
    switch (data.type) {
      case $Enums.RequestType.CREATE:
        path = 'request';
        break;
      case $Enums.RequestType.EDIT:
        path = 'request';
        break;
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
    case $Enums.DecisionStatus.PROVISIONED:
      decisionColor = 'green';
      decisionText = 'Provisioned';
      DecisionIcon = IconCircleCheck;
      break;
  }

  const badges = (
    <>
      {/* <Badge
        leftSection={<TypeIcon className="h-6 w-6" />}
        color={typeColor}
        size="lg"
        radius="sm"
        autoContrast
        className=""
      >
        {data.type}
      </Badge> */}
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
        className="text-gray-900 bg-white border-solid border-2 border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          router.push(`/${data.cloud}/requests/${data.id}/${path}`);
        }}
      >
        <Indicator color={data.active ? 'lime' : 'red'}>
          <Badge autoContrast size="xl" color="rgba(200, 200, 200, 1)" radius="md" className="mb-1">
            <TypeIcon className="inline-block" />
            {data.type} Request
          </Badge>
          <div>{badges}</div>
          {data.createdByEmail && (
            <div className="text-center text-sm text-gray-400">
              Submitted by <span>{data.createdByEmail}</span>
            </div>
          )}
        </Indicator>
      </button>
    </Tooltip>
  );
}
