import formatDate from '@/utils/date';
import Image from 'next/image';
import Edit from '@/components/assets/edit.svg';
import { PrivateProject } from '@/queries/types';
import classNames from '@/utils/classnames';
import Avtar from '@/components/table/Avatar';

const tailwindColors = {
  red: ['bg-red-100', 'text-red-700', 'fill-red-500'],
  blue: ['bg-blue-100', 'text-blue-700', 'fill-blue-500'],
  green: ['bg-green-100', 'text-green-700', 'fill-green-500'],
  grey: ['bg-gray-100', 'text-gray-700', 'fill-gray-500'],
  // ... add other colors here
};

function TypeBadge({ status }: { status: string }) {
  let text = '';
  let colour!: keyof typeof tailwindColors;

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

export const privateCloudProjectDataToRow = (project: any) => {
  return {
    id: project.id,
    name: project.name,
    ministry: project.ministry,
    cluster: project.cluster,
    requestDecisionStatus: project?.activeRequest ? project?.activeRequest[0]?.decisionStatus : null,
    requestType: project?.activeRequest ? project?.activeRequest[0]?.type : null,
    projectOwner: {
      name: `${project.projectOwner.firstName} ${project.projectOwner.lastName}`,
      email: project.projectOwner.email,
    },
    primaryTechnicalLead: {
      name: `${project.primaryTechnicalLead.firstName} ${project.primaryTechnicalLead.lastName}`,
      email: project.primaryTechnicalLead.email,
    },
    secondaryTechnicalLead: project.secondaryTechnicalLead
      ? {
          name: `${project.secondaryTechnicalLead.firstName} ${project.secondaryTechnicalLead.lastName}`,
          email: project.secondaryTechnicalLead.email,
        }
      : null,
    created: formatDate(project.created.$date),
    updatedAt: formatDate(project.updatedAt.$date),
    requestCreated: formatDate(project?.activeRequest ? project?.activeRequest[0]?.created.$date : null),
    // requestDecisionDate: formatDate(project?.activeRequest ? project?.activeRequest[0]?.decisionDate.$date : null),
    licencePlate: project.licencePlate,
    status: project.status,
  };
};

export const publicCloudProjectDataToRow = (project: any) => {
  return {
    id: project.id,
    name: project.name,
    ministry: project.ministry,
    cluster: project.provider,
    requestDecisionStatus: project?.activeRequest ? project?.activeRequest[0]?.decisionStatus : null,
    requestType: project?.activeRequest ? project?.activeRequest[0]?.type : null,
    projectOwner: {
      name: `${project.projectOwner.firstName} ${project.projectOwner.lastName}`,
      email: project.projectOwner.email,
    },
    primaryTechnicalLead: {
      name: `${project.primaryTechnicalLead.firstName} ${project.primaryTechnicalLead.lastName}`,
      email: project.primaryTechnicalLead.email,
    },
    secondaryTechnicalLead: project.secondaryTechnicalLead
      ? {
          name: `${project.secondaryTechnicalLead.firstName} ${project.secondaryTechnicalLead.lastName}`,
          email: project.secondaryTechnicalLead.email,
        }
      : null,
    created: formatDate(project.created.$date),
    updatedAt: formatDate(project.updatedAt.$date),
    licencePlate: project.licencePlate,
    status: project.status,
  };
};

export const privateCloudRequestDataToRow = (request: any) => {
  return {
    id: request.id,
    type: <span className=" capitalize">{request.type.toLowerCase()}</span>,
    status: <TypeBadge status={request.decisionStatus} />,
    name: request.requestedProject.name,
    ministry: request.requestedProject.ministry,
    cluster: request.requestedProject.cluster,
    projectOwner: `${request.requestedProject.projectOwner.firstName} ${request.requestedProject.projectOwner.lastName}`,
    technicalLeads: `${request.requestedProject.primaryTechnicalLead.firstName} ${
      request.requestedProject.primaryTechnicalLead.lastName
    } ${request?.requestedProject.secondaryTechnicalLead ? ',' : ''} ${
      request?.requestedProject.secondaryTechnicalLead?.firstName || ''
    } ${request?.requestedProject.secondaryTechnicalLead?.lastName || ''}`,
    created: <p className="w-28">{formatDate(request.created.$date)}</p>,
    licencePlate: <p className="w-28">{request.requestedProject.licencePlate}</p>,
  };
};

export const publicCloudRequestDataToRow = (request: any) => {
  return {
    id: request.id,
    type: <span className=" capitalize">{request.type.toLowerCase()}</span>,
    status: <TypeBadge status={request.decisionStatus} />,
    name: request.requestedProject.name,
    cluster: request.requestedProject.provider,
    ministry: request.requestedProject.ministry,
    projectOwner: `${request.requestedProject.projectOwner.firstName} ${request.requestedProject.projectOwner.lastName}`,
    technicalLeads: `${request.requestedProject.primaryTechnicalLead.firstName} ${
      request.requestedProject.primaryTechnicalLead.lastName
    } ${request?.requestedProject.secondaryTechnicalLead ? ',' : ''} ${
      request?.requestedProject?.secondaryTechnicalLead?.firstName || ''
    } ${request?.requestedProject?.secondaryTechnicalLead?.lastName || ''}`,
    created: <p className="w-28">{formatDate(request?.requestedProject.created.$date)}</p>,
    licencePlate: <p className="w-28">{request?.requestedProject?.licencePlate}</p>,
  };
};
