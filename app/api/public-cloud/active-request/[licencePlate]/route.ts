import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/core/prisma';
import { string, z } from 'zod';
import { Prisma } from '@prisma/client';

// See this for pagination: https://github.com/Puppo/it-s-prisma-time/blob/10-pagination/src/index.ts

export type PublicCloudRequestWithCurrentAndRequestedProject = Prisma.PublicCloudRequestGetPayload<{
  include: {
    requestedProject: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
      };
    };
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
    const request: PublicCloudRequestWithCurrentAndRequestedProject | null = await prisma.publicCloudRequest.findFirst({
      where: {
        licencePlate,
        active: true,
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

    // if (!request) {
    //   return new NextResponse("No project found for this licence plate.", {
    //     status: 404,
    //   });
    // }

    return NextResponse.json(request);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
