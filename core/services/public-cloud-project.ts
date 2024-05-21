import { Prisma, $Enums } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';
import { PublicCloudProjectDecorate } from '@/types/doc-decorate';

type PublicCloudProject = Prisma.PublicCloudProjectGetPayload<{
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

export class PublicCloudProjectService extends ModelService<Prisma.PublicCloudProjectWhereInput> {
  async readFilter() {
    if (!this.session?.userId) return false;
    if (this.session.permissions.viewAllPublicCloudProducts) return true;

    const baseFilter: Prisma.PublicCloudProjectWhereInput = {
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
    if (this.session.permissions.editAllPublicCloudProducts) return true;

    const baseFilter: Prisma.PublicCloudProjectWhereInput = {
      OR: [
        { projectOwnerId: this.session.userId as string },
        { primaryTechnicalLeadId: this.session.userId as string },
        { secondaryTechnicalLeadId: this.session.userId },
        { ministry: { in: this.session.ministries.editor as $Enums.Ministry[] } },
      ],
    };

    return baseFilter;
  }

  async decorate<T>(doc: T & PublicCloudProject & PublicCloudProjectDecorate) {
    let activeRequests = [];

    if (doc.requests) {
      activeRequests = doc.requests.filter((req) => req.active);
    } else {
      activeRequests = await prisma.publicCloudRequest.findMany({ where: { projectId: doc.id, active: true } });
    }

    const isActive = doc.status === $Enums.ProjectStatus.ACTIVE;
    const provisioningRequests = activeRequests.filter((req) => req.decisionStatus === $Enums.DecisionStatus.APPROVED);
    const hasActiveRequest = activeRequests.length > 0;
    const hasProvisioningRequest = provisioningRequests.length > 0;

    const isMyProduct = [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(
      this.session.userId,
    );

    const canView =
      this.session.permissions.viewAllPublicCloudProducts ||
      isMyProduct ||
      this.session.ministries.reader.includes(doc.ministry);

    const canEdit =
      isActive &&
      !hasActiveRequest &&
      canView &&
      (this.session.permissions.editAllPublicCloudProducts || this.session.ministries.editor.includes(doc.ministry));

    const canViewHistroy =
      this.session.permissions.viewAllPublicCloudProductsHistory ||
      this.session.ministries.editor.includes(doc.ministry);

    const canReprovision = isActive && (this.session.isAdmin || this.session.isPublicAdmin);

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
