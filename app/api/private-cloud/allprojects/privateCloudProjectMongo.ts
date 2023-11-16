// converting mongodb objects into a form that typescript understands
export interface PrivateCloudProjectMongo {
  _id: { $oid: string };
  licencePlate: string;
  name: string;
  description: string;
  status: string;
  created: { $date: string };
  projectOwnerId: { $oid: string };
  primaryTechnicalLeadId?: { $oid: string };
  secondaryTechnicalLeadId?: { $oid: string } | null;
  ministry: string;
  cluster: string;
}
