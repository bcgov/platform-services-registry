import Table from "@/components/Table";
import prisma from "@/lib/prisma";
import { PrivateCloudProject } from "@prisma/client";

const headers = [
  "Name",
  "Description",
  "Ministry",
  "Project Owner",
  "Technical Leads",
  "Created",
  "Licence Plate"
];

export default async function Page() {
  const projects: PrivateCloudProject[] =
    await prisma.privateCloudProject.findMany({
      include: {
        projectOwner: true,
        primaryTechnicalLead: true,
        secondaryTechnicalLead: true
      }
    });

  return <Table headers={headers} rows={[]} />;
}
