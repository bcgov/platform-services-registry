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
      skipPermissions: true as never,
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

    const canEdit = canReview && doc.type !== $Enums.RequestType.DELETE;
    const hasProduct =
      doc.type !== $Enums.RequestType.CREATE || doc.decisionStatus === $Enums.DecisionStatus.PROVISIONED;

    if (!hasProduct) {
      doc._permissions = {
        view: true,
        edit: canEdit,
        review: canReview,
        delete: false,
        viewProduct: false,
      };

      return doc;
    }

    doc._permissions = {
      view: true,
      edit: canEdit,
      review: canReview,
      delete: false,
      viewProduct: hasProduct,
    };

    return doc;
  }
}
