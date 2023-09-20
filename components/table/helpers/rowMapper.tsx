import formatDate from "@/components/utils/formatdates";
import Image from "next/image";
import Edit from "@/components/assets/edit.svg";
import { Project } from "@/queries/project";

export const privateCloudProjectDataToRow = (project: Project) => {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    ministry: project.ministry,
    cluster: project.cluster,
    projectOwner: `${project.projectOwnerDetails.firstName} ${project.projectOwnerDetails.lastName}`,
    technicalLeads: `${project.primaryTechnicalLeadDetails.firstName} ${project.primaryTechnicalLeadDetails.lastName}, ${project.secondaryTechnicalLeadDetails.firstName} ${project.secondaryTechnicalLeadDetails.lastName}`,
    // @ts-ignore
    created: formatDate(project.created["$date"]),
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
    technicalLeads: `${project.primaryTechnicalLeadDetails.firstName} ${project.primaryTechnicalLeadDetails.lastName}, ${project.secondaryTechnicalLeadDetails.firstName} ${project.secondaryTechnicalLeadDetails.lastName}`,
    created: formatDate(project.created["$date"]),
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
    name: request.requestedProject.name,
    ministry: request.requestedProject.ministry,
    cluster: request.requestedProject.cluster,
    projectOwner: `${request.projectOwner.firstName} ${request.projectOwner.lastName}`,
    technicalLeads: `${request.primaryTechnicalLead.firstName} ${
      request.primaryTechnicalLead.lastName
    } ${request?.secondaryTechnicalLead ? "," : ""} ${
      request?.secondaryTechnicalLead?.firstName || ""
    } ${request?.secondaryTechnicalLead?.lastName || ""}`,
    created: formatDate(request.created["$date"]),
    licencePlate: request.licencePlate,
  };
};

export const publicCloudRequestDataToRow = (request: any) => {
  return {
    id: request.id,
    type: request.type,
    name: request.requestedProject.name,
    csp: request.requestedProject.provider,
    ministry: request.requestedProject.ministry,
    projectOwner: `${request.requestedProject.firstName} ${request.requestedProject.lastName}`,
    technicalLeads: `${request.requestedProject.firstName} ${request.requestedProject.lastName}, ${request.requestedProject.firstName} ${request.requestedProject.lastName}`,
    created: formatDate(request.created["$date"]),
    licencePlate: request.licencePlate,
  };
};
