import { NextRequest, NextResponse } from "next/server";
import {
  DecisionStatus,
  PrivateCloudRequest,
  PrivateCloudRequestedProject,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { string, z } from "zod";
// import { sendProvisionedEmails } from "../ches/emailHandlers.js";

// See this for pagination: https://github.com/Puppo/it-s-prisma-time/blob/10-pagination/src/index.ts

<<<<<<<< HEAD:app/api/provision/private-cloud/[licencePlate]/route.ts
export type PrivateCloudRequestWithAllRelations =
  Prisma.PrivateCloudRequestGetPayload<{
    include: {
      project: {
        include: {
          projectOwner: true;
          primaryTechnicalLead: true;
          secondaryTechnicalLead: true;
        };
      };
      adminRequestedProject: {
        include: {
          projectOwner: true;
          primaryTechnicalLead: true;
          secondaryTechnicalLead: true;
        };
      };
      requestedProject: {
        include: {
          projectOwner: true;
          primaryTechnicalLead: true;
          secondaryTechnicalLead: true;
        };
      };
    };
  }>;

const GetParamsSchema = z.object({
  licencePlate: string()
========
export type PrivateCloudRequestWithRequestedProject =
  Prisma.PrivateCloudRequestGetPayload<{
    include: {
      requestedProject: true;
    };
  }>;

const ParamsSchema = z.object({
  licencePlate: string(),
>>>>>>>> main:app/api/private-cloud/provision/[licencePlate]/route.ts
});

type Params = z.infer<typeof ParamsSchema>;

export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const parsedParams = ParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  const { licencePlate } = params;

  try {
<<<<<<<< HEAD:app/api/provision/private-cloud/[licencePlate]/route.ts
    const request: PrivateCloudRequestWithAllRelations | null =
      await prisma.privateCloudRequest.findUnique({
        where: {
          decisionStatus: DecisionStatus.APPROVED,
          licencePlate_active: {
            licencePlate: licencePlate,
            active: true
          }
        },
        include: {
          project: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
              secondaryTechnicalLead: true
            }
          },
          adminRequestedProject: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
              secondaryTechnicalLead: true
            }
          },
          requestedProject: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
              secondaryTechnicalLead: true
            }
          }
        }
========
    const request: PrivateCloudRequestWithRequestedProject | null =
      await prisma.privateCloudRequest.findFirst({
        where: {
          decisionStatus: DecisionStatus.APPROVED,
          licencePlate,
          active: true,
        },
        include: {
          requestedProject: true,
        },
>>>>>>>> main:app/api/private-cloud/provision/[licencePlate]/route.ts
      });

    if (!request) {
      console.log("No provision request found for project: " + licencePlate);
      return new NextResponse("No requetst found for this licece plate.", {
        status: 404,
      });
    }

<<<<<<<< HEAD:app/api/provision/private-cloud/[licencePlate]/route.ts
    if (!request.requestedProject || !request.adminRequestedProject) {
      console.log(
        "Requested project or admin requested project not found for project: " +
          licencePlate
      );
      return new NextResponse(
        "Requested project or admin requested project not found.",
        { status: 404 }
      );
    }

    const updateRequest = prisma.privateCloudRequest.update({
      where: {
        id: request.id
========
    const updateRequest = prisma.privateCloudRequest.update({
      where: {
        id: request.id,
>>>>>>>> main:app/api/private-cloud/provision/[licencePlate]/route.ts
      },
      data: {
        decisionStatus: DecisionStatus.PROVISIONED,
        active: false,
      },
    });

<<<<<<<< HEAD:app/api/provision/private-cloud/[licencePlate]/route.ts
========
    const { id, ...requestedProject } = request.requestedProject;

>>>>>>>> main:app/api/private-cloud/provision/[licencePlate]/route.ts
    // Upsert the project with the requested project data. If admin requested project data exists, use that instead.
    const upsertProject = prisma.privateCloudProject.upsert({
      where: {
        licencePlate: licencePlate,
      },
<<<<<<<< HEAD:app/api/provision/private-cloud/[licencePlate]/route.ts
      update: (request.adminRequestedProject
        ? request.adminRequestedProject
        : request.requestedProject) as Prisma.PrivateCloudProjectUpdateInput,
      create: (request.adminRequestedProject
        ? request.adminRequestedProject
        : request.requestedProject) as Prisma.PrivateCloudProjectCreateInput
========
      update: requestedProject as PrivateCloudRequestedProject,
      create: requestedProject as PrivateCloudRequestedProject,
>>>>>>>> main:app/api/private-cloud/provision/[licencePlate]/route.ts
    });

    await prisma.$transaction([updateRequest, upsertProject]);

    // sendProvisionedEmails(request);
    return new NextResponse(
      `Successfuly marked ${licencePlate} as provisioned.`,
      { status: 200 }
    );
  } catch (error: any) {
    console.log(error.message);
    return new NextResponse(error.message, { status: 500 });
  }
}
