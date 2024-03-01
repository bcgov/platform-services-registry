import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrivateCloudProject } from '@prisma/client';
import prisma from '@/core/prisma';
import { string, z } from 'zod';
// import { sendProvisionedEmails } from "../ches/emailHandlers.js";

// See this for pagination: https://github.com/Puppo/it-s-prisma-time/blob/10-pagination/src/index.ts

export type PrivateCloudProjectWithUsers = Prisma.PrivateCloudProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
  };
}>;

const GetParamsSchema = z.object({
  licencePlate: string(),
});

type Params = z.infer<typeof GetParamsSchema>;

export async function GET(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  const parsedParams = GetParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  const { licencePlate } = params;

  try {
    const project: PrivateCloudProject | null = await prisma.privateCloudProject.findUnique({
      where: {
        licencePlate,
      },
      include: {
        projectOwner: true,
        primaryTechnicalLead: true,
        secondaryTechnicalLead: true,
      },
    });

    if (!project) {
      return new NextResponse('No project found for this licence plate.', {
        status: 404,
      });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
