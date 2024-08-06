import { Prisma, PrismaClient, $Enums, RequestType, DecisionStatus, TaskType } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';
import { PublicCloudProjectDecorate, PublicCloudRequestDecorate } from '@/types/doc-decorate';

type PublicCloudRequest = Prisma.PublicCloudRequestGetPayload<{
  select: {
    id: true;
    type: true;
    decisionStatus: true;
    createdByEmail: true;
    licencePlate: true;
    decisionData: true;
    mouSigned: true;
    mouApproved: true;
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
    const mouSigningRequestIds = this.session.tasks
      .filter((task) => [TaskType.SIGN_MOU, TaskType.APPROVE_MOU].includes(task.type))
      .map((task) => (task.data as { requestId: string }).requestId);

    const baseFilter: Prisma.PublicCloudRequestWhereInput = {
      OR: [
        { licencePlate: { in: licencePlates } },
        { id: { in: mouSigningRequestIds } },
        { type: RequestType.CREATE, createdByEmail: { equals: this.session.user.email, mode: 'insensitive' } },
      ],
    };

    return baseFilter;
  }

  async writeFilter() {
    if (this.session.permissions.reviewAllPublicCloudRequests) return true;
    return false;
  }

  async decorate<T>(doc: T & PublicCloudRequest & PublicCloudRequestDecorate) {
    let canReview =
      doc.decisionStatus === DecisionStatus.PENDING && this.session.permissions.reviewAllPublicCloudRequests;

    let canSignMou = true;
    let canApproveMou = true;

    if (doc.type === RequestType.CREATE) {
      canSignMou =
        !doc.mouSigned &&
        this.session.tasks
          .filter((task) => task.type === TaskType.SIGN_MOU)
          .map((task) => (task.data as { requestId: string }).requestId)
          .includes(doc.id);

      canApproveMou =
        !doc.mouSigned &&
        !doc.mouApproved &&
        this.session.tasks
          .filter((task) => task.type === TaskType.APPROVE_MOU)
          .map((task) => (task.data as { requestId: string }).requestId)
          .includes(doc.id);

      // canReview = canReview && doc.mouSigned && doc.mouApproved;
      canReview = true;
    }

    const canEdit = canReview && doc.type !== RequestType.DELETE;
    const hasProduct = doc.type !== RequestType.CREATE || doc.decisionStatus === DecisionStatus.PROVISIONED;

    if (!hasProduct) {
      doc._permissions = {
        view: true,
        edit: canEdit,
        review: canReview,
        signMou: canSignMou,
        approveMou: canApproveMou,
        delete: false,
        viewProduct: false,
      };

      return doc;
    }

    doc._permissions = {
      view: true,
      edit: canEdit,
      review: canReview,
      signMou: canSignMou,
      approveMou: canApproveMou,
      delete: false,
      viewProduct: hasProduct,
    };

    return doc;
  }
}
