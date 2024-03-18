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
        { ministry: { in: this.session.ministries.admin as $Enums.Ministry[] } },
        { ministry: { in: this.session.ministries.readonly as $Enums.Ministry[] } },
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
        { ministry: { in: this.session.ministries.admin as $Enums.Ministry[] } },
      ],
    };

    return baseFilter;
  }

  async decorate<T>(doc: T & PrivateCloudProject & PrivateCloudProjectDecorate) {
    let hasActiveRequest = false;
    if (doc.requests) {
      hasActiveRequest = doc.requests.some((req) => req.active);
    } else {
      const requestCount = await prisma.privateCloudRequest.count({ where: { projectId: doc.id } });
      hasActiveRequest = requestCount > 0;
    }

    const canEdit =
      this.session.permissions.editAllPrivateCloudProducts ||
      [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(this.session.userId) ||
      this.session.ministries.admin.includes(doc.ministry);

    const canView =
      this.session.permissions.viewAllPrivateCloudProducts ||
      canEdit ||
      this.session.ministries.readonly.includes(doc.ministry);

    doc._permissions = {
      view: canView,
      edit: canEdit && !hasActiveRequest,
      delete: canEdit && !hasActiveRequest,
    };

    return doc;
  }
}
