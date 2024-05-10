import { Prisma, $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { ModelService } from '@/core/model-service';
import { PrivateCloudProjectDecorate } from '@/types/doc-decorate';

type PrivateCloudProject = Prisma.PrivateCloudProjectGetPayload<{
  select: {
    id: true;
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

    const provisioningRequests = activeRequests.filter((req) => req.decisionStatus === $Enums.DecisionStatus.APPROVED);
    const hasActiveRequest = activeRequests.length > 0;
    const hasProvisioningRequest = provisioningRequests.length > 0;

    const canEdit =
      this.session.permissions.editAllPrivateCloudProducts ||
      [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(this.session.userId) ||
      this.session.ministries.editor.includes(doc.ministry);

    const canView =
      this.session.permissions.viewAllPrivateCloudProducts ||
      canEdit ||
      this.session.ministries.reader.includes(doc.ministry);

    const canViewHistroy =
      this.session.permissions.viewAllPrivateCloudProductsHistory ||
      this.session.ministries.editor.includes(doc.ministry);

    doc._permissions = {
      view: canView,
      viewHistory: canViewHistroy,
      edit: canEdit && !hasActiveRequest,
      delete: canEdit && !hasActiveRequest,
      resend: hasProvisioningRequest && (this.session.isAdmin || this.session.isPrivateAdmin),
      reprovision: this.session.isAdmin || this.session.isPrivateAdmin,
    };

    return doc;
  }
}
