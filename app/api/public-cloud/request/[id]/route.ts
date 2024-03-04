import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { string, z } from 'zod';

const GetParamsSchema = z.object({
  id: string(),
});

type Params = z.infer<typeof GetParamsSchema>;

export type PublicCloudRequestWithCurrentAndRequestedProject = Prisma.PublicCloudRequestGetPayload<{
  include: {
    requestedProject: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
    project: {
      include: {
        projectOwner: true;
        primaryTechnicalLead: true;
        secondaryTechnicalLead: true;
        expenseAuthority: true;
      };
    };
  };
}>;

export async function GET(req: NextRequest, { params }: { params: Params }): Promise<NextResponse> {
  const parsedParams = GetParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  const { id } = params;

  try {
    const request: PublicCloudRequestWithCurrentAndRequestedProject | null = await prisma.publicCloudRequest.findUnique(
      {
        where: {
          id,
        },
        include: {
          project: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
              secondaryTechnicalLead: true,
              expenseAuthority: true,
            },
          },
          requestedProject: {
            include: {
              projectOwner: true,
              primaryTechnicalLead: true,
              secondaryTechnicalLead: true,
              expenseAuthority: true,
            },
          },
        },
      },
    );

    if (!request) {
      return new NextResponse('No project found with this licece plate.', {
        status: 404,
      });
    }

    return NextResponse.json(request);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
