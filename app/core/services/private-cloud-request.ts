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
      skipPermissions: true as never,
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

    const canEdit = canReview && doc.type !== $Enums.RequestType.DELETE;
    const canResend =
      doc.decisionStatus === $Enums.DecisionStatus.APPROVED && this.session.permissions.reviewAllPrivateCloudRequests;

    const hasProduct =
      doc.type !== $Enums.RequestType.CREATE || doc.decisionStatus === $Enums.DecisionStatus.PROVISIONED;

    const canViewDecision = doc.decisionStatus !== $Enums.DecisionStatus.PENDING || canReview;

    if (!hasProduct) {
      doc._permissions = {
        view: true,
        edit: canEdit,
        review: canReview,
        resend: canResend,
        delete: false,
        viewDecision: canViewDecision,
        viewProduct: false,
      };

      return doc;
    }

    doc._permissions = {
      view: true,
      edit: canEdit,
      review: canReview,
      resend: canResend,
      delete: false,
      viewDecision: canViewDecision,
      viewProduct: hasProduct,
    };

    return doc;
  }
}
