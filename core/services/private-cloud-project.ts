import { Prisma, $Enums } from '@prisma/client';
import { ModelService } from '@/core/model-service';

export class PrivateCloudProjectService extends ModelService<Prisma.PrivateCloudProjectWhereInput> {
  async readFilter() {
    if (!this.session) return false;
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

  async decorate<T>(
    doc: { _permissions: { view: boolean; edit: boolean; delete: boolean; review: boolean } } & T & Record<string, any>,
  ) {
    const canEdit =
      this.session.permissions.editAllPrivateCloudProducts ||
      [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(this.session.userId) ||
      this.session.ministries.admin.includes(doc.ministry);

    const canView = canEdit || this.session.ministries.readonly.includes(doc.ministry);

    doc._permissions = {
      view: canView,
      edit: canEdit,
      delete: canEdit,
      review: this.session.permissions.reviewAllPrivateCloudRequests,
    };

    return doc;
  }
}
