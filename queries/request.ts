import { PrivateCloudRequest } from "@prisma/client";
import prisma from "@/lib/prisma";

export const getPrivateCloudActiveRequests = (): Promise<
  PrivateCloudRequest[]
> =>
  prisma.privateCloudRequest.findMany({
    where: {
      active: true
    }
  });

export const getPrivateCloudActiveRequestById = (
  requestId: string
): Promise<PrivateCloudRequest | null> =>
  prisma.privateCloudRequest.findUnique({
    where: {
      id: requestId,
      active: true
    }
  });

export const getPrivateCloudRequestById = (
  requestId: string
): Promise<PrivateCloudRequest | null> =>
  prisma.privateCloudRequest.findUnique({
    where: {
      id: requestId
    }
  });

export const getUserPrivateCloudRequestById = (
  requestId: string,
  authEmail: string
): Promise<PrivateCloudRequest | null> =>
  prisma.privateCloudRequest.findUnique({
    where: {
      id: requestId,
      OR: [
        {
          requestedProject: {
            OR: [
              { projectOwner: { email: authEmail } },
              { primaryTechnicalLead: { email: authEmail } },
              { secondaryTechnicalLead: { email: authEmail } }
            ]
          }
        },
        {
          project: {
            OR: [
              { projectOwner: { email: authEmail } },
              { primaryTechnicalLead: { email: authEmail } },
              { secondaryTechnicalLead: { email: authEmail } }
            ]
          }
        }
      ]
    }
  });

export const getUserPrivateCloudRequests = (
  authEmail: string
): Promise<PrivateCloudRequest[]> =>
  prisma.privateCloudRequest.findMany({
    where: {
      OR: [
        {
          requestedProject: {
            OR: [
              { projectOwner: { email: authEmail } },
              { primaryTechnicalLead: { email: authEmail } },
              { secondaryTechnicalLead: { email: authEmail } }
            ]
          }
        },
        {
          project: {
            OR: [
              { projectOwner: { email: authEmail } },
              { primaryTechnicalLead: { email: authEmail } },
              { secondaryTechnicalLead: { email: authEmail } }
            ]
          }
        }
      ]
    }
  });

export const getUserPrivateCloudActiveRequests = (
  authEmail: string
): Promise<PrivateCloudRequest[]> =>
  prisma.privateCloudRequest.findMany({
    where: {
      active: true,
      OR: [
        {
          requestedProject: {
            OR: [
              { projectOwner: { email: authEmail } },
              { primaryTechnicalLead: { email: authEmail } },
              { secondaryTechnicalLead: { email: authEmail } }
            ]
          }
        },
        {
          project: {
            OR: [
              { projectOwner: { email: authEmail } },
              { primaryTechnicalLead: { email: authEmail } },
              { secondaryTechnicalLead: { email: authEmail } }
            ]
          }
        }
      ]
    }
  });

export const getUserPrivateCloudActiveRequestById = (
  requestId: string,
  authEmail: string
): Promise<PrivateCloudRequest | null> =>
  prisma.privateCloudRequest.findUnique({
    where: {
      id: requestId,
      active: true
    }
  });

// export const getUserPrivateCloudActiveRequestsByIds = (
//   requestIds: string[],
//   authEmail: string
// ): Promise<PrivateCloudRequest[]> =>
//   prisma.privateCloudRequest.findMany({
//     where: {
//       user: { email: authEmail },
//       id: { in: requestIds },
//       active: true
//     }
//   });
