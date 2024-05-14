import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';

export class SecurityConfigService extends ModelService<Prisma.SecurityConfigWhereInput> {
  async readFilter() {
    if (!this.session) return false;
    if (this.session.isAdmin) return true;

    const [privateRes, publicRes] = await Promise.all([
      prisma.privateCloudProject.findMany({
        select: { licencePlate: true },
        session: this.session as never,
      }),
      prisma.publicCloudProject.findMany({ select: { licencePlate: true }, session: this.session as never }),
    ]);

    const privateOR = privateRes.map(({ licencePlate }) => ({
      licencePlate,
      context: $Enums.ProjectContext.PRIVATE,
    }));
    const publicOR = publicRes.map(({ licencePlate }) => ({ licencePlate, context: $Enums.ProjectContext.PUBLIC }));

    const OR = [...privateOR, ...publicOR];

    if (OR.length === 0) return false;

    const baseFilter: Prisma.SecurityConfigWhereInput = {
      OR,
    };

    return baseFilter;
  }

  async writeFilter() {
    return this.readFilter();
  }

  async decorate<T>(
    doc: { _permissions: { view: boolean; edit: boolean; delete: boolean } } & T & Record<string, any>,
  ) {
    const query = { where: { licencePlate: doc.licencePlate }, session: this.session as never };

    const privateQuery = {
      ...query,
      select: { projectOwnerId: true, primaryTechnicalLeadId: true, secondaryTechnicalLeadId: true, cluster: true },
    };

    const publicQuery = {
      ...query,
      select: { projectOwnerId: true, primaryTechnicalLeadId: true, secondaryTechnicalLeadId: true, provider: true },
    };

    const project = await (doc.context === $Enums.ProjectContext.PRIVATE
      ? prisma.privateCloudProject.findFirst(privateQuery)
      : prisma.publicCloudProject.findFirst(publicQuery));

    const projectWithPermissions = project as typeof project & {
      _permissions: { view: boolean; edit: boolean; delete: boolean };
    };

    doc._permissions = {
      view: projectWithPermissions._permissions.view,
      edit: projectWithPermissions._permissions.edit,
      delete: false,
    };

    return doc;
  }
}
