import { Tooltip, Badge, Indicator } from '@mantine/core';
import { $Enums } from '@prisma/client';
import { IconHourglass, IconPencil, IconTrash, IconFilePlus } from '@tabler/icons-react';
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

  let typeColor = 'gray';
  let TypeIcon = null;

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

  switch (data.decisionStatus) {
    case $Enums.DecisionStatus.PENDING:
      decisionColor = 'teal';
      decisionText = 'Reviewing';
      break;
    case $Enums.DecisionStatus.APPROVED:
      decisionColor = 'lime';
      decisionText = 'Approved';
      break;
    case $Enums.DecisionStatus.PROVISIONED:
      decisionColor = 'cyan';
      decisionText = 'Provisioned';
      break;
  }

  const badges = (
    <>
      <Badge
        leftSection={<TypeIcon className="h-6 w-6" />}
        color={typeColor}
        size="lg"
        radius="sm"
        autoContrast
        className=""
      >
        {data.type}
      </Badge>
      <Badge
        leftSection={<IconHourglass className="h-6 w-6" />}
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

          router.push(`/${data.cloud}/requests/${data.id}/decision`);
        }}
      >
        <Indicator color={data.active ? 'lime' : 'red'}>
          <Badge autoContrast size="xl" color="rgba(200, 200, 200, 1)" radius="md" className="mb-1">
            Active Request
          </Badge>
          <div>{badges}</div>
          {/* <div className="text-center text-sm text-gray-400">
          Submitted by <span>{data.createdByEmail}</span>
        </div> */}
        </Indicator>
      </button>
    </Tooltip>
  );
}
