import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DecisionStatus, Cluster, User } from '@prisma/client';
import { string, z } from 'zod';
import { PrivateCloudDecisionRequestBodySchema } from '@/schema';
import makeDecisionRequest, {
  PrivateCloudRequestWithRequestedProject,
} from '@/requestActions/private-cloud/decisionRequest';
import sendPrivateCloudNatsMessage from '@/nats/privateCloud';
import { subscribeUsersToMautic } from '@/mautic';
import { sendRequestApprovalEmails } from '@/ches/emailHandler';

const ParamsSchema = z.object({
  licencePlate: string(),
});

type Params = z.infer<typeof ParamsSchema>;

export async function POST(req: NextRequest, { params }: { params: Params }) {
  // Athentication
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('You do not have the required credentials.', {
      status: 401,
    });
  }

  const { email: authEmail, roles: authRoles } = session.user;

  if (!authRoles.includes('admin')) {
    return new NextResponse('You must be an admin to make a request decision.', {
      status: 403,
    });
  }

  const body = await req.json();

  // Validation
  const parsedParams = ParamsSchema.safeParse(params);
  const parsedBody = PrivateCloudDecisionRequestBodySchema.safeParse(body);

  if (!parsedParams.success) {
    console.log(parsedParams.error.message);
    return new Response(parsedParams.error.message, { status: 400 });
  }

  if (!parsedBody.success) {
    console.log(parsedBody.error.message);
    return new Response(parsedBody.error.message, { status: 400 });
  }

  const { licencePlate } = parsedParams.data;
  const { decision, humanComment, ...requestedProjectFormData } = parsedBody.data;

  const request: PrivateCloudRequestWithRequestedProject = await makeDecisionRequest(
    licencePlate,
    decision,
    humanComment,
    requestedProjectFormData,
    authEmail,
  );

  if (!request.requestedProject) {
    return new Response(`Error creating decision request for ${request.licencePlate}.`, {
      status: 400,
    });
  }

  if (request.decisionStatus !== DecisionStatus.APPROVED) {
    // Send emails
    sendRequestRejectionEmails(request);
    return new NextResponse(`Request for ${request.licencePlate} succesfully created as rejected.`, {
      status: 200,
    });
  }

  const contactChanged =
    requestedProjectFormData.projectOwner.email !== request.requestedProject.projectOwner.email ||
    requestedProjectFormData.primaryTechnicalLead.email !== request.requestedProject.primaryTechnicalLead.email ||
    requestedProjectFormData.secondaryTechnicalLead?.email !== request.requestedProject?.secondaryTechnicalLead?.email;

  await sendPrivateCloudNatsMessage(request.id, request.type, request.requestedProject, contactChanged);

  // For GOLD requests, we create an identical request for GOLDDR
  if (request.requestedProject.cluster === Cluster.GOLD) {
    await sendPrivateCloudNatsMessage(
      request.id,
      request.type,
      { ...request.requestedProject, cluster: Cluster.GOLDDR },
      contactChanged,
    );
  }

  const users: User[] = [
    request.requestedProject.projectOwner,
    request.requestedProject.primaryTechnicalLead,
    request.requestedProject?.secondaryTechnicalLead,
  ].filter((user): user is User => Boolean(user));

  // Subscribe users to Mautic
  await subscribeUsersToMautic(users, request.requestedProject.cluster, 'Private');

  // Send emails
  sendRequestApprovalEmails(request);

  return new NextResponse(`Decision request for ${request.licencePlate} succesfully created.`, {
    status: 200,
  });
}
function sendRequestRejectionEmails(
  request: {
    requestedProject: {
      projectOwner: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        image: string | null;
        ministry: string | null;
        archived: boolean;
        created: Date;
        lastSeen: Date;
      };
      primaryTechnicalLead: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        image: string | null;
        ministry: string | null;
        archived: boolean;
        created: Date;
        lastSeen: Date;
      };
      secondaryTechnicalLead: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        image: string | null;
        ministry: string | null;
        archived: boolean;
        created: Date;
        lastSeen: Date;
      } | null;
    } & {
      id: string;
      name: string;
      description: string;
      status: import('.prisma/client').$Enums.ProjectStatus;
      licencePlate: string;
      created: Date;
      projectOwnerId: string;
      primaryTechnicalLeadId: string;
      secondaryTechnicalLeadId: string | null;
      ministry: import('.prisma/client').$Enums.Ministry;
      cluster: import('.prisma/client').$Enums.Cluster;
    } & {
      productionQuota: { cpu: string; memory: string; storage: string };
      testQuota: { cpu: string; memory: string; storage: string };
      developmentQuota: { cpu: string; memory: string; storage: string };
      toolsQuota: { cpu: string; memory: string; storage: string };
      commonComponents: { other: string; noServices: boolean } & {
        addressAndGeolocation: { planningToUse: boolean; implemented: boolean };
        workflowManagement: { planningToUse: boolean; implemented: boolean };
        formDesignAndSubmission: { planningToUse: boolean; implemented: boolean };
        identityManagement: { planningToUse: boolean; implemented: boolean };
        paymentServices: { planningToUse: boolean; implemented: boolean };
        documentManagement: { planningToUse: boolean; implemented: boolean };
        endUserNotificationAndSubscription: { planningToUse: boolean; implemented: boolean };
        publishing: { planningToUse: boolean; implemented: boolean };
        businessIntelligence: { planningToUse: boolean; implemented: boolean };
      };
    };
  } & {
    id: string;
    licencePlate: string;
    createdByEmail: string;
    decisionMakerEmail: string | null;
    type: import('.prisma/client').$Enums.RequestType;
    decisionStatus: import('.prisma/client').$Enums.DecisionStatus;
    humanComment: string | null;
    active: boolean;
    created: Date;
    decisionDate: Date | null;
    projectId: string | null;
    requestedProjectId: string;
    userRequestedProjectId: string;
  },
) {
  throw new Error('Function not implemented.');
}
