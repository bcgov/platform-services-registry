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
    if (!this.session.isUser && !this.session.isServiceAccount) return false;
    if (this.session.permissions.viewAllPrivateCloudProducts) return true;

    const baseFilter: Prisma.PrivateCloudProjectWhereInput = {
      OR: [
        { projectOwnerId: this.session.user.id as string },
        { primaryTechnicalLeadId: this.session.user.id as string },
        { secondaryTechnicalLeadId: this.session.user.id },
        { ministry: { in: this.session.ministries.editor as $Enums.Ministry[] } },
        { ministry: { in: this.session.ministries.reader as $Enums.Ministry[] } },
      ],
    };

    return baseFilter;
  }

  async writeFilter() {
    if (!this.session.isUser && !this.session.isServiceAccount) return false;
    if (this.session.permissions.editAllPrivateCloudProducts) return true;

    const baseFilter: Prisma.PrivateCloudProjectWhereInput = {
      OR: [
        { projectOwnerId: this.session.user.id as string },
        { primaryTechnicalLeadId: this.session.user.id as string },
        { secondaryTechnicalLeadId: this.session.user.id },
        { ministry: { in: this.session.ministries.editor as $Enums.Ministry[] } },
      ],
    };

    return baseFilter;
  }

  async decorate<T>(doc: T & PrivateCloudProject & PrivateCloudProjectDecorate) {
    let hasActiveRequest = false;

    if (doc.requests) {
      hasActiveRequest = doc.requests.some((req) => req.active);
    } else {
      hasActiveRequest = (await prisma.privateCloudRequest.count({ where: { projectId: doc.id, active: true } })) > 0;
    }

    const isActive = doc.status === $Enums.ProjectStatus.ACTIVE;
    const isMyProduct = [doc.projectOwnerId, doc.primaryTechnicalLeadId, doc.secondaryTechnicalLeadId].includes(
      this.session.user.id,
    );

    const canView =
      this.session.permissions.viewAllPrivateCloudProducts ||
      isMyProduct ||
      this.session.ministries.reader.includes(doc.ministry) ||
      this.session.ministries.editor.includes(doc.ministry);

    const canEdit =
      isActive &&
      !hasActiveRequest &&
      (this.session.permissions.editAllPrivateCloudProducts ||
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
