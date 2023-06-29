import formatDate from "@/components/utils/formatdates";
import Image from "next/image";
import Edit from "@/components/assets/edit.svg";

export const privateCloudProjectDataToRow = (project: any) => {
  return {
    name: project.name,
    description: project.description,
    ministry: project.ministry,
    cluster: project.cluster,
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

export const publicCloudProjectDataToRow = (project: any) => {
  return {
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
    type: request.type,
    name: request.requestedProject.name,
    ministry: request.requestedProject.ministry,
    cluster: request.requestedProject.cluster,
    projectOwner: `${request.requestedProject.firstName} ${request.requestedProject.lastName}`,
    technicalLeads: `${request.requestedProject.firstName} ${request.requestedProject.lastName}, ${request.requestedProject.firstName} ${request.requestedProject.lastName}`,
    created: formatDate(request.created["$date"]),
    licencePlate: request.licencePlate,
  };
};
