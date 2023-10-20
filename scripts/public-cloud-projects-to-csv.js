const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Papa = require("papaparse");
const fs = require("fs");

async function fetchPublicCloudProjects() {
  try {
    const projects = await prisma.publicCloudProject.findMany({
      include: {
        projectOwner: {
          select: {
            id: true,
            ministry: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        primaryTechnicalLead: {
          select: {
            id: true,
            ministry: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        secondaryTechnicalLead: {
          select: {
            id: true,
            ministry: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // Format the projects data for CSV
    const dataForCsv = projects.map((project) => {
      const { projectOwner, primaryTechnicalLead, secondaryTechnicalLead } =
        project;
      return {
        "Licence Plate": project.licencePlate,
        Provider: project.provider,
        "Project Name": project.name,
        "Project Description": project.description,
        "Project Status": project.status,
        "Date Created": project.created,
        "Account Coding": project.accountCoding,
        "Project Owner Name": `${projectOwner.firstName} ${project.projectOwner.lastName}`,
        "Project Owner Email": project.projectOwner.email,
        "Project Owner Ministry": project.projectOwner.ministry,
        "Primary Technical Lead Name": `${primaryTechnicalLead.firstName} ${project.primaryTechnicalLead.lastName}`,
        "Primary Technical Lead Email": primaryTechnicalLead.email,
        "Primary Technical Lead Ministry": primaryTechnicalLead.ministry,
        "Secondary Technical Lead Name": secondaryTechnicalLead
          ? `${secondaryTechnicalLead.firstName} ${secondaryTechnicalLead.lastName}`
          : "N/A",
        "Secondary Technical Lead Email": secondaryTechnicalLead
          ? secondaryTechnicalLead?.email
          : "N/A",
        "Secondary Technical Lead Ministry": secondaryTechnicalLead
          ? secondaryTechnicalLead?.ministry
          : "N/A",
        "Dev Budget": project.budget.dev,
        "Test Budget": project.budget.test,
        "Prod Budget": project.budget.prod,
        "Tools Budget": project.budget.tools
      };
    });

    // Convert to CSV format using PapaParse
    const csv = Papa.unparse(dataForCsv);

    // Write to a CSV file
    fs.writeFileSync("output.csv", csv);
    console.log("CSV has been written to output.csv");
  } catch (error) {
    console.error("Error fetching public cloud projects:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fetchPublicCloudProjects();
