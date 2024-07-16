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
    if (!this.session.isUser && !this.session.isServiceAccount) return false;
    if (this.session.permissions.viewAllPublicCloudProducts) return true;

    const baseFilter: Prisma.PublicCloudProjectWhereInput = {
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
    if (this.session.permissions.editAllPublicCloudProducts) return true;

    const baseFilter: Prisma.PublicCloudProjectWhereInput = {
      OR: [
        { projectOwnerId: this.session.user.id as string },
        { primaryTechnicalLeadId: this.session.user.id as string },
        { secondaryTechnicalLeadId: this.session.user.id },
        { ministry: { in: this.session.ministries.editor as $Enums.Ministry[] } },
      ],
    };

    return baseFilter;
  }

  async decorate<T>(doc: T & PublicCloudProject & PublicCloudProjectDecorate) {
    let hasActiveRequest = false;

    if (doc.requests) {
      hasActiveRequest = doc.requests.some((req) => req.active);
    } else {
      hasActiveRequest = (await prisma.publicCloudRequest.count({ where: { projectId: doc.id, active: true } })) > 0;
    }

    const isActive = doc.status === $Enums.ProjectStatus.ACTIVE;
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
