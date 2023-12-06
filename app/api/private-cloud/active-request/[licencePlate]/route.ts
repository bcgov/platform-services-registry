import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { string, z } from 'zod';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { Session } from 'next-auth';
// import { sendProvisionedEmails } from "../ches/emailHandlers.js";

// See this for pagination: https://github.com/Puppo/it-s-prisma-time/blob/10-pagination/src/index.ts

export type PrivateCloudRequestWithCurrentAndRequestedProject = Prisma.PrivateCloudRequestGetPayload<{
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
  const session = await getServerSession(authOptions);
  const parsedParams = GetParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  const { licencePlate } = params;

  try {
    const request: PrivateCloudRequestWithCurrentAndRequestedProject | null =
      await prisma.privateCloudRequest.findFirst({
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
        session: session as never,
        skipSecurity: true as never,
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
