import { Prisma, PrismaClient, ProjectContext } from '@prisma/client';
import { ModelService } from '@/core/model-service';
import prisma from '@/core/prisma';

export class SonarScanResultService extends ModelService<Prisma.SonarScanResultWhereInput> {
  async readFilter() {
    if (!this.session) return false;
    if (this.session.permissions.viewSonarscanResults) return true;

    const [privateRes, publicRes] = await Promise.all([
      prisma.privateCloudProject.findMany({
        select: { licencePlate: true },
        session: this.session as never,
      }),
      prisma.publicCloudProject.findMany({ select: { licencePlate: true }, session: this.session as never }),
    ]);

    const privateOR = privateRes.map(({ licencePlate }) => ({
      licencePlate,
      context: ProjectContext.PRIVATE,
    }));
    const publicOR = publicRes.map(({ licencePlate }) => ({ licencePlate, context: ProjectContext.PUBLIC }));

    const OR = [...privateOR, ...publicOR];

    if (OR.length === 0) return false;

    const baseFilter: Prisma.SonarScanResultWhereInput = {
      OR,
    };

    return baseFilter;
  }

  async writeFilter() {
    return false;
  }

  async decorate<T>(
    doc: { _permissions: { view: boolean; edit: boolean; delete: boolean } } & T & Record<string, any>,
  ) {
    doc._permissions = {
      view: true,
      edit: false,
      delete: false,
    };

    return doc;
  }
}
