import formatDate from '@/components/utils/formatdates';
import Image from 'next/image';
import Edit from '@/components/assets/edit.svg';
import { Project } from '@/paginatedQueries/private-cloud';
import classNames from '@/components/utils/classnames';

function TypeBadge({ status }: { status: string }) {
  let text, colour;

  switch (status) {
    case 'APPROVED':
      text = 'Processing';
      colour = 'blue';
      break;
    case 'PENDING':
      text = 'Pending Approval';
      colour = 'grey';
      break;
    case 'REJECTED':
      text = 'Rejected';
      colour = 'red';
      break;
    case 'PROVISIONED':
      text = 'Provisioned';
      colour = 'green';
      break;
    default:
      text = status;
      colour = 'grey';
  }

  const tailwindColors = {
    red: ['bg-red-100', 'text-red-700', 'fill-red-500'],
    blue: ['bg-blue-100', 'text-blue-700', 'fill-blue-500'],
    green: ['bg-green-100', 'text-green-700', 'fill-green-500'],
    grey: ['bg-gray-100', 'text-gray-700', 'fill-gray-500'],
    // ... add other colors here
  };

  //@ts-ignore
  const classes = tailwindColors[colour] || [];

  return (
    <span
      className={classNames(
        'inline-flex',
        'items-center',
        'gap-x-1.5',
        'rounded-full',
        'px-2',
        'py-1',
        'text-xs',
        'font-medium',
        classes[0], // Background class
        classes[1], // Text color class
      )}
    >
      <svg
        className={classNames(
          'h-1.5',
          'w-1.5',
          classes[2], // SVG fill class
        )}
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx={3} cy={3} r={3} />
      </svg>
      {text}
    </span>
  );
}

export const privateCloudProjectDataToRow = (project: Project) => {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    ministry: project.ministry,
    cluster: project.cluster,
    projectOwner: `${project.projectOwnerDetails.firstName} ${project.projectOwnerDetails.lastName}`,
    technicalLeads: `${project.primaryTechnicalLeadDetails.firstName} ${project.primaryTechnicalLeadDetails.lastName} ${
      project.secondaryTechnicalLeadDetails?.firstName || ''
    } ${project.secondaryTechnicalLeadDetails ? ',' : ''} ${project.secondaryTechnicalLeadDetails?.lastName || ''}`,
    // @ts-ignore
    created: formatDate(project.created['$date']),
    licencePlate: project.licencePlate,
    edit: (
      <div
        className="pr-4 sm:pr-6 lg:pr-8
      >"
      >
        <div
          className=" w-4 h-3 "
          // pr-4 sm:pr-6 lg:pr-8
        >
          <Image alt="Edit icon" src={Edit} width={16} height={12.5} />
        </div>
      </div>
    ),
  };
};

export const publicCloudProjectDataToRow = (project: any) => {
  return {
    id: project.id,
    name: project.name,
    csp: project.provider,
    description: project.description,
    ministry: project.ministry,
    projectOwner: `${project.projectOwnerDetails.firstName} ${project.projectOwnerDetails.lastName}`,
    technicalLeads: `${project.primaryTechnicalLeadDetails.firstName} ${project.primaryTechnicalLeadDetails.lastName} ${
      project.secondaryTechnicalLeadDetails?.firstName || ''
    } ${project.secondaryTechnicalLeadDetails ? ',' : ''} ${project.secondaryTechnicalLeadDetails?.lastName || ''}`,
    created: formatDate(project.created['$date']),
    licencePlate: project.licencePlate,
    edit: (
      <div
        className="pr-4 sm:pr-6 lg:pr-8
      >"
      >
        <div
          className=" w-4 h-3 "
          // pr-4 sm:pr-6 lg:pr-8
        >
          <Image alt="Edit icon" src={Edit} width={16} height={12.5} />
        </div>
      </div>
    ),
  };
};

export const privateCloudRequestDataToRow = (request: any) => {
  return {
    id: request.id,
    type: request.type,
    status: <TypeBadge status={request.decisionStatus} />,
    name: request.requestedProject.name,
    ministry: request.requestedProject.ministry,
    cluster: request.requestedProject.cluster,
    projectOwner: `${request.projectOwner.firstName} ${request.projectOwner.lastName}`,
    technicalLeads: `${request.primaryTechnicalLead.firstName} ${request.primaryTechnicalLead.lastName} ${
      request?.secondaryTechnicalLead ? ',' : ''
    } ${request?.secondaryTechnicalLead?.firstName || ''} ${request?.secondaryTechnicalLead?.lastName || ''}`,
    created: formatDate(request.created['$date']),
    licencePlate: request.licencePlate,
  };
};

export const publicCloudRequestDataToRow = (request: any) => {
  return {
    id: request.id,
    type: <TypeBadge status={request.decisionStatus} />,
    status: request.decisionStatus,
    name: request.requestedProject.name,
    csp: request.requestedProject.provider,
    ministry: request.requestedProject.ministry,
    projectOwner: `${request.projectOwner.firstName} ${request.projectOwner.lastName}`,
    technicalLeads: `${request.primaryTechnicalLead.firstName} ${request.primaryTechnicalLead.lastName} ${
      request?.secondaryTechnicalLead ? ',' : ''
    } ${request?.secondaryTechnicalLead?.firstName || ''} ${request?.secondaryTechnicalLead?.lastName || ''}`,
    created: formatDate(request.created['$date']),
    licencePlate: request.licencePlate,
  };
};
