import { Prisma, $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { ModelService } from '@/core/model-service';
import { PublicCloudProjectDecorate } from '@/types/doc-decorate';

type PublicCloudProject = Prisma.PublicCloudProjectGetPayload<{
  select: {
    id: true;
    projectOwnerId: true;
    primaryTechnicalLeadId: true;
    secondaryTechnicalLeadId: true;
    ministry: true;
    requests: true;
  };
}>;

export class PublicCloudProjectService extends ModelService<Prisma.PublicCloudProjectWhereInput> {
  async readFilter() {
    if (!this.session) return false;
    if (this.session.permissions.viewAllPublicCloudProducts) return true;

    const baseFilter: Prisma.PublicCloudProjectWhereInput = {
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
    if (this.session.permissions.editAllPublicCloudProducts) return true;

    const baseFilter: Prisma.PublicCloudProjectWhereInput = {
      OR: [
        { projectOwnerId: this.session.userId as string },
        { primaryTechnicalLeadId: this.session.userId as string },
        { secondaryTechnicalLeadId: this.session.userId },
        { ministry: { in: this.session.ministries.admin as $Enums.Ministry[] } },
      ],
    };

    return baseFilter;
  }

  async decorate<T>(doc: T & PublicCloudProject & PublicCloudProjectDecorate) {
    let hasActiveRequest = false;
    if (doc.requests) {
      hasActiveRequest = doc.requests.some((req) => req.active);
    } else {
      const requestCount = await prisma.privateCloudRequest.count({ where: { projectId: doc.id } });
      hasActiveRequest = requestCount > 0;
    }

    const canEdit =
      this.session.permissions.editAllPublicCloudProducts ||
      [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(this.session.userId) ||
      this.session.ministries.admin.includes(doc.ministry);

    const canView =
      this.session.permissions.viewAllPublicCloudProducts ||
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
