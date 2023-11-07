export interface ProjectOwnerDetails {
  email: string;
  firstName: string;
  lastName: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created: string;
  licencePlate: string;
  ministry: string;
  status: string;
  projectOwnerId: string;
  primaryTechnicalLeadId: string;
  secondaryTechnicalLeadId: string;
  projectOwnerDetails: ProjectOwnerDetails;
  primaryTechnicalLeadDetails: ProjectOwnerDetails;
  secondaryTechnicalLeadDetails: ProjectOwnerDetails;
}

export interface PrivateProject extends Project {
  cluster: string;
}

export interface PublicProject extends Project {
  provider: string;
}
