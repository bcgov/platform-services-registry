import { Prisma, $Enums } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';
import { PrivateCloudProjectDecorate } from '@/types/doc-decorate';

type PrivateCloudProject = Prisma.PrivateCloudProjectGetPayload<{
  select: {
    id: true;
    status: true;
    projectOwnerId: true;
    primaryTechnicalLeadId: true;
    secondaryTechnicalLeadId: true;
    ministry: true;
    requests: true;
  };
}>;

export class PrivateCloudProjectService extends ModelService<Prisma.PrivateCloudProjectWhereInput> {
  async readFilter() {
    if (!this.session?.userId) return false;
    if (this.session.permissions.viewAllPrivateCloudProducts) return true;

    const baseFilter: Prisma.PrivateCloudProjectWhereInput = {
      OR: [
        { projectOwnerId: this.session.userId as string },
        { primaryTechnicalLeadId: this.session.userId as string },
        { secondaryTechnicalLeadId: this.session.userId },
        { ministry: { in: this.session.ministries.editor as $Enums.Ministry[] } },
        { ministry: { in: this.session.ministries.reader as $Enums.Ministry[] } },
      ],
    };

    return baseFilter;
  }

  async writeFilter() {
    if (!this.session) return false;
    if (this.session.permissions.editAllPrivateCloudProducts) return true;

    const baseFilter: Prisma.PrivateCloudProjectWhereInput = {
      OR: [
        { projectOwnerId: this.session.userId as string },
        { primaryTechnicalLeadId: this.session.userId as string },
        { secondaryTechnicalLeadId: this.session.userId },
        { ministry: { in: this.session.ministries.editor as $Enums.Ministry[] } },
      ],
    };

    return baseFilter;
  }

  async decorate<T>(doc: T & PrivateCloudProject & PrivateCloudProjectDecorate) {
    let activeRequests = [];

    if (doc.requests) {
      activeRequests = doc.requests.filter((req) => req.active);
    } else {
      activeRequests = await prisma.privateCloudRequest.findMany({ where: { projectId: doc.id, active: true } });
    }

    const isActive = doc.status === $Enums.ProjectStatus.ACTIVE;
    const hasActiveRequest = activeRequests.length > 0;

    const isMyProduct = [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(
      this.session.userId,
    );

    const canView =
      this.session.permissions.viewAllPrivateCloudProducts ||
      isMyProduct ||
      this.session.ministries.reader.includes(doc.ministry);

    const canEdit =
      isActive &&
      !hasActiveRequest &&
      (this.session.permissions.editAllPublicCloudProducts ||
        isMyProduct ||
        this.session.ministries.editor.includes(doc.ministry));

    const canViewHistroy =
      this.session.permissions.viewAllPrivateCloudProductsHistory ||
      this.session.ministries.editor.includes(doc.ministry);

    const canReprovision = isActive && (this.session.isAdmin || this.session.isPrivateAdmin);

    doc._permissions = {
      view: canView,
      viewHistory: canViewHistroy,
      edit: canEdit,
      delete: canEdit,
      reprovision: canReprovision,
    };

    return doc;
  }
}
