export interface User {
  email: string;
  firstName: string;
  lastName: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  created: ProjectCreated;
  updatedAt: ProjectCreated;
  licencePlate: string;
  ministry: string;
  status: string;
  projectOwnerId: string;
  primaryTechnicalLeadId: string;
  secondaryTechnicalLeadId: string;
  projectOwner: User;
  primaryTechnicalLead: User;
  secondaryTechnicalLead: User;
}

export interface PrivateProject extends Project {
  cluster: string;
}

export interface PublicProject extends Project {
  provider: string;
}

export interface ProjectCreated {
  $date: string;
}
