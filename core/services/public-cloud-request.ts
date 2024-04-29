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
    console.log('decorate doc:', doc);
    const canReview =
      doc.decisionStatus === $Enums.DecisionStatus.PENDING && this.session.permissions.reviewAllPublicCloudRequests;

    const canEdit = canReview && doc.type !== $Enums.RequestType.DELETE;

    if (doc.type === $Enums.RequestType.CREATE) {
      doc._permissions = {
        view: this.session.permissions.viewAllPublicCloudProducts || doc.createdByEmail === this.session.user.email,
        edit: canEdit,
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

    if (docWithPermissions) {
      doc._permissions = {
        view: docWithPermissions._permissions.view,
        edit: canEdit,
        review: canReview,
        delete: false,
      };
    } else {
      // If a product isn't found, it indicates manual removal of the product.
      doc._permissions = {
        view: false,
        edit: false,
        review: false,
        delete: false,
      };
    }

    return doc;
  }
}
