import { NextRequest, NextResponse } from "next/server";
import { PublicCloudProject, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { string, z } from "zod";

export type PublicCloudProjectWithUsers = Prisma.PublicCloudProjectGetPayload<{
  include: {
    projectOwner: true;
    primaryTechnicalLead: true;
    secondaryTechnicalLead: true;
  };
}>;

const GetParamsSchema = z.object({
  licencePlate: string()
});

type Params = z.infer<typeof GetParamsSchema>;

export async function GET(
  req: NextRequest,
  { params }: { params: Params }
): Promise<NextResponse> {
  const parsedParams = GetParamsSchema.safeParse(params);

  if (!parsedParams.success) {
    return new NextResponse(parsedParams.error.message, { status: 400 });
  }

  const { licencePlate } = params;

  try {
    const project: PublicCloudProject | null =
      await prisma.publicCloudProject.findUnique({
        where: {
          licencePlate
        },
        include: {
          projectOwner: true,
          primaryTechnicalLead: true,
          secondaryTechnicalLead: true
        }
      });

    if (!project) {
      return new NextResponse("No project found for this licece plate.", {
        status: 404
      });
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return new NextResponse(error.message, { status: 500 });
  }
}
