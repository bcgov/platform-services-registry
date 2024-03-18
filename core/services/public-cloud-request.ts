import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';
import { PublicCloudProjectDecorate, PublicCloudRequestDecorate } from '@/types/doc-decorate';

type PublicCloudRequest = Prisma.PublicCloudRequestGetPayload<{
  select: {
    type: true;
    decisionStatus: true;
    createdByEmail: true;
    licencePlate: true;
  };
}>;

export class PublicCloudRequestService extends ModelService<Prisma.PublicCloudRequestWhereInput> {
  async readFilter() {
    if (!this.session?.userId) return false;

    if (this.session.permissions.viewAllPublicCloudProducts) return true;

    const res = await prisma.publicCloudProject.findMany({
      select: { licencePlate: true },
      session: this.session as never,
    });

    const licencePlates = res.map(({ licencePlate }) => licencePlate);

    const baseFilter: Prisma.PublicCloudRequestWhereInput = {
      OR: [
        { licencePlate: { in: licencePlates } },
        { type: $Enums.RequestType.CREATE, createdByEmail: { equals: this.session.user.email, mode: 'insensitive' } },
      ],
    };

    return baseFilter;
  }

  async writeFilter() {
    if (this.session.permissions.reviewAllPublicCloudRequests) return true;
    return false;
  }

  async decorate<T>(doc: T & PublicCloudRequest & PublicCloudRequestDecorate) {
    const canReview =
      doc.decisionStatus === $Enums.DecisionStatus.PENDING && this.session.permissions.reviewAllPublicCloudRequests;

    if (doc.type === $Enums.RequestType.CREATE) {
      doc._permissions = {
        view: this.session.permissions.viewAllPublicCloudProducts || doc.createdByEmail === this.session.user.email,
        edit: canReview,
        review: canReview,
        delete: false,
      };

      return doc;
    }

    const res = await prisma.publicCloudProject.findFirst({
      where: { licencePlate: doc.licencePlate },
      select: { projectOwnerId: true, primaryTechnicalLeadId: true, secondaryTechnicalLeadId: true, ministry: true },
      session: this.session as never,
    });

    const docWithPermissions = res as typeof res & PublicCloudProjectDecorate;

    doc._permissions = {
      view: docWithPermissions._permissions.view,
      edit: canReview,
      review: canReview,
      delete: false,
    };

    return doc;
  }
}
