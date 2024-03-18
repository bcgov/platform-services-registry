import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';
import { PrivateCloudProjectDecorate, PrivateCloudRequestDecorate } from '@/types/doc-decorate';

type PrivateCloudRequest = Prisma.PrivateCloudRequestGetPayload<{
  select: {
    type: true;
    decisionStatus: true;
    createdByEmail: true;
    licencePlate: true;
  };
}>;

export class PrivateCloudRequestService extends ModelService<Prisma.PrivateCloudRequestWhereInput> {
  async readFilter() {
    if (!this.session?.userId) return false;
    if (this.session.permissions.reviewAllPrivateCloudRequests) return true;

    const res = await prisma.privateCloudProject.findMany({
      select: { licencePlate: true },
      session: this.session as never,
    });

    const licencePlates = res.map(({ licencePlate }) => licencePlate);

    const baseFilter: Prisma.PrivateCloudRequestWhereInput = {
      OR: [
        { licencePlate: { in: licencePlates } },
        { type: $Enums.RequestType.CREATE, createdByEmail: { equals: this.session.user.email, mode: 'insensitive' } },
      ],
    };

    return baseFilter;
  }

  async writeFilter() {
    if (this.session.permissions.reviewAllPrivateCloudRequests) return true;
    return false;
  }

  async decorate<T>(doc: T & PrivateCloudRequest & PrivateCloudRequestDecorate) {
    const canReview =
      doc.decisionStatus === $Enums.DecisionStatus.PENDING && this.session.permissions.reviewAllPrivateCloudRequests;

    if (doc.type === $Enums.RequestType.CREATE) {
      doc._permissions = {
        view: this.session.permissions.viewAllPrivateCloudProducts || doc.createdByEmail === this.session.user.email,
        edit: canReview,
        review: canReview,
        delete: false,
      };

      return doc;
    }

    const res = await prisma.privateCloudProject.findFirst({
      where: { licencePlate: doc.licencePlate },
      select: { projectOwnerId: true, primaryTechnicalLeadId: true, secondaryTechnicalLeadId: true, ministry: true },
      session: this.session as never,
    });

    const docWithPermissions = res as typeof res & PrivateCloudProjectDecorate;

    doc._permissions = {
      view: docWithPermissions._permissions.view,
      edit: canReview,
      review: canReview,
      delete: false,
    };

    return doc;
  }
}
