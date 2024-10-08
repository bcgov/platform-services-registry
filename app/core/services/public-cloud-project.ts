import { Prisma, TaskType, Ministry, ProjectStatus, TaskStatus } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';
import { PublicCloudProductDetailDecorated } from '@/types/public-cloud';

function getUniqueNonFalsyItems(arr: (string | null | undefined | boolean | number)[]): string[] {
  const uniqueItems: string[] = [];

  for (const item of arr) {
    if (item && typeof item === 'string') {
      if (!uniqueItems.includes(item)) {
        uniqueItems.push(item);
      }
    }
  }

  return uniqueItems;
}

export class PublicCloudProjectService extends ModelService<Prisma.PublicCloudProjectWhereInput> {
  async readFilter() {
    if (!this.session.isUser && !this.session.isServiceAccount) return false;
    if (this.session.permissions.viewAllPublicCloudProducts) return true;

    const OR: Prisma.PublicCloudProjectWhereInput[] = [
      { ministry: { in: this.session.ministries.editor as Ministry[] } },
      { ministry: { in: this.session.ministries.reader as Ministry[] } },
    ];

    const licencePlatesFromTasks = this.session.tasks
      .filter((task) => [TaskType.SIGN_MOU, TaskType.REVIEW_MOU].includes(task.type))
      .map((task) => (task.data as { licencePlate: string }).licencePlate);

    if (this.session.user.id) {
      OR.push(
        { projectOwnerId: this.session.user.id as string },
        { primaryTechnicalLeadId: this.session.user.id as string },
        { secondaryTechnicalLeadId: this.session.user.id },
        { licencePlate: { in: getUniqueNonFalsyItems(licencePlatesFromTasks) } },
      );
    }

    const baseFilter: Prisma.PublicCloudProjectWhereInput = { OR };

    return baseFilter;
  }

  async writeFilter() {
    if (!this.session.isUser && !this.session.isServiceAccount) return false;
    if (this.session.permissions.editAllPublicCloudProducts) return true;

    const OR: Prisma.PublicCloudProjectWhereInput[] = [
      { ministry: { in: this.session.ministries.editor as Ministry[] } },
    ];

    if (this.session.user.id) {
      OR.push(
        { projectOwnerId: this.session.user.id as string },
        { primaryTechnicalLeadId: this.session.user.id as string },
        { secondaryTechnicalLeadId: this.session.user.id },
      );
    }

    const baseFilter: Prisma.PublicCloudProjectWhereInput = { OR };

    return baseFilter;
  }

  async decorate<T>(doc: T & PublicCloudProductDetailDecorated) {
    let hasActiveRequest = false;

    if (doc.requests) {
      hasActiveRequest = doc.requests.some((req) => req.active);
    } else {
      hasActiveRequest = (await prisma.publicCloudRequest.count({ where: { projectId: doc.id, active: true } })) > 0;
    }

    const isActive = doc.status === ProjectStatus.ACTIVE;
    const isMyProduct = [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(
      this.session.user.id,
    );

    const canView =
      this.session.permissions.viewAllPublicCloudProducts ||
      isMyProduct ||
      this.session.ministries.reader.includes(doc.ministry) ||
      this.session.ministries.editor.includes(doc.ministry);

    const canEdit =
      isActive &&
      !hasActiveRequest &&
      (this.session.permissions.editAllPublicCloudProducts ||
        isMyProduct ||
        this.session.ministries.editor.includes(doc.ministry));

    const canViewHistroy =
      this.session.permissions.viewAllPublicCloudProductsHistory ||
      this.session.ministries.editor.includes(doc.ministry);

    const canReprovision = isActive && (this.session.isAdmin || this.session.isPublicAdmin);

    let canSignMou = false;
    let canApproveMou = false;

    if (doc.billing) {
      canSignMou =
        !doc.billing.signed &&
        this.session.tasks
          .filter((task) => task.type === TaskType.SIGN_MOU && task.status === TaskStatus.ASSIGNED)
          .map((task) => (task.data as { licencePlate: string }).licencePlate)
          .includes(doc.licencePlate);

      canApproveMou =
        doc.billing.signed &&
        !doc.billing.approved &&
        this.session.tasks
          .filter((task) => task.type === TaskType.REVIEW_MOU && task.status === TaskStatus.ASSIGNED)
          .map((task) => (task.data as { licencePlate: string }).licencePlate)
          .includes(doc.licencePlate);
    }

    doc._permissions = {
      view: canView || canSignMou || canApproveMou,
      viewHistory: canViewHistroy,
      edit: canEdit,
      delete: canEdit,
      reprovision: canReprovision,
      signMou: canSignMou,
      reviewMou: canApproveMou,
    };

    return doc;
  }
}
