import formatDate from "@/components/utils/formatdates";
import Image from "next/image";
import Edit from "@/components/assets/edit.svg";

export const privateCloudDataToRow = (project: any) => {
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

export const publicCloudDataToRow = (project: any) => {
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
