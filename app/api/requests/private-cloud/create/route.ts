import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Prisma } from "@prisma/client";
import { CreateRequestBodySchema, CreateRequestBody } from "@/schema";
import { PrivateCloudRequest } from "@prisma/client";
import createRequest from "@/app/requestActions/private-cloud/createRequest";
// import { sendCreateRequestEmails } from "@/ches/emailHandlers.js";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("You do not have the required credentials.", {
      status: 403,
    });
  }

  const { email: authEmail, roles: authRoles } = session.user;

  const body = await req.json();
  const parsedBody = CreateRequestBodySchema.safeParse(body);

  if (!parsedBody.success) {
    return new NextResponse(parsedBody.error.message, { status: 400 });
  }

  const formData: CreateRequestBody = parsedBody.data;

  if (
    ![
      formData.projectOwner.email,
      formData.primaryTechnicalLead.email,
      formData.secondaryTechnicalLead?.email,
    ].includes(authEmail) &&
    !authRoles.includes("admin")
  ) {
    throw new Error(
      "You need to assign yourself to this project in order to create it."
    );
  }

  let request: PrivateCloudRequest;

  try {
    request = await createRequest(formData, authEmail);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error(e.message);
    }
    throw e;
  }

  // sendCreateRequestEmails(createRequest.requestedProject);

  return NextResponse.json(request, {
    status: 200,
  });
}
