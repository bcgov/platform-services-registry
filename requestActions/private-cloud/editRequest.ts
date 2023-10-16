<<<<<<< HEAD
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
=======
>>>>>>> main
import {
  RequestType,
  PrivateCloudRequest,
  DecisionStatus,
  PrivateCloudProject,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
<<<<<<< HEAD
import { EditRequestBodySchema, EditRequestBody, UserInput } from "@/schema";
import { string, z } from "zod";

export default async function editRequest(
  projectId: string,
  formData: EditRequestBody,
=======
import { PrivateCloudEditRequestBody } from "@/schema";

export default async function editRequest(
  licencePlate: string,
  formData: PrivateCloudEditRequestBody,
>>>>>>> main
  authEmail: string
): Promise<PrivateCloudRequest> {
  // Get the current project that we are creating an edit request for
  const project: PrivateCloudProject | null =
    await prisma.privateCloudProject.findUnique({
      where: {
<<<<<<< HEAD
        id: projectId,
=======
        licencePlate: licencePlate,
>>>>>>> main
      },
      include: {
        projectOwner: true,
        primaryTechnicalLead: true,
        secondaryTechnicalLead: true,
      },
    });

  if (!project) {
    throw new Error("Project does not exist.");
  }

  // merge the form data with the existing project data
  const requestedProject = {
    ...formData,
    licencePlate: project.licencePlate,
    status: project.status,
    cluster: project.cluster,
    created: project.created,
    projectOwner: {
      connectOrCreate: {
        where: {
          email: formData.projectOwner.email,
        },
        create: formData.projectOwner,
      },
    },
    primaryTechnicalLead: {
      connectOrCreate: {
        where: {
          email: formData.primaryTechnicalLead.email,
        },
        create: formData.primaryTechnicalLead,
      },
    },
    secondaryTechnicalLead: formData.secondaryTechnicalLead
      ? {
          connectOrCreate: {
            where: {
              email: formData.secondaryTechnicalLead.email,
            },
            create: formData.secondaryTechnicalLead,
          },
        }
      : undefined,
  };

  // The edit request will requre manual admin approval if any of the quotas are being changed.
  const isQuotaChanged = !(
    JSON.stringify(formData.productionQuota) ===
      JSON.stringify(project.productionQuota) &&
    JSON.stringify(formData.testQuota) === JSON.stringify(project.testQuota) &&
    JSON.stringify(formData.developmentQuota) ===
      JSON.stringify(project.developmentQuota) &&
    JSON.stringify(formData.toolsQuota) === JSON.stringify(project.toolsQuota)
  );

  let decisionStatus: DecisionStatus;

  // If there is no quota change, the request is automatically approved
  if (isQuotaChanged) {
    decisionStatus = DecisionStatus.PENDING;
  } else {
    decisionStatus = DecisionStatus.APPROVED;
  }

  return prisma.privateCloudRequest.create({
    data: {
      type: RequestType.EDIT,
      decisionStatus: decisionStatus,
      active: true,
      createdByEmail: authEmail,
      licencePlate: project.licencePlate,
      requestedProject: {
        create: requestedProject,
      },
<<<<<<< HEAD
      project: {
        connect: {
          id: projectId,
=======
      userRequestedProject: {
        create: requestedProject,
      },
      project: {
        connect: {
          licencePlate: licencePlate,
>>>>>>> main
        },
      },
    },
    include: {
      project: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
      requestedProject: {
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true,
        },
      },
    },
  });
}
