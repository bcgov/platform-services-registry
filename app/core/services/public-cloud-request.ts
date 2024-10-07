import { Prisma, RequestType, DecisionStatus, TaskType, TaskStatus } from '@prisma/client';
import _compact from 'lodash-es/compact';
import _uniq from 'lodash-es/uniq';
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
    decisionData: {
      include: {
        billing: true;
      };
    };
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
    const licencePlatesFromTasks = this.session.tasks
      .filter((task) => [TaskType.SIGN_MOU, TaskType.REVIEW_MOU].includes(task.type))
      .map((task) => (task.data as { licencePlate: string }).licencePlate);

    const baseFilter: Prisma.PublicCloudRequestWhereInput = {
      OR: [
        { licencePlate: { in: _compact(_uniq([...licencePlates, ...licencePlatesFromTasks])) } },
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

    let canSignMou = false;
    let canApproveMou = false;

    if (doc.type === RequestType.CREATE) {
      if (doc.decisionData.billing) {
        canSignMou =
          !doc.decisionData.billing.signed &&
          this.session.tasks
            .filter((task) => task.type === TaskType.SIGN_MOU && task.status === TaskStatus.ASSIGNED)
            .map((task) => (task.data as { licencePlate: string }).licencePlate)
            .includes(doc.licencePlate);

        canApproveMou =
          doc.decisionData.billing.signed &&
          !doc.decisionData.billing.approved &&
          this.session.tasks
            .filter((task) => task.type === TaskType.REVIEW_MOU && task.status === TaskStatus.ASSIGNED)
            .map((task) => (task.data as { licencePlate: string }).licencePlate)
            .includes(doc.licencePlate);

        canReview = canReview && doc.decisionData.billing.signed && doc.decisionData.billing.approved;
      } else {
        canReview = false;
      }
    }

    const canEdit = canReview && doc.type !== RequestType.DELETE;
    const hasProduct = doc.type !== RequestType.CREATE || doc.decisionStatus === DecisionStatus.PROVISIONED;

    if (!hasProduct) {
      doc._permissions = {
        view: true,
        edit: canEdit,
        review: canReview,
        signMou: canSignMou,
        reviewMou: canApproveMou,
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
      reviewMou: canApproveMou,
      delete: false,
      viewProduct: hasProduct,
    };

    return doc;
  }
}
