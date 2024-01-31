import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import prisma from '@/lib/prisma';
import { ModelService } from '../modelService';

export class SonarScanResultService extends ModelService<Prisma.SonarScanResultWhereInput> {
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

    const baseFilter: Prisma.SonarScanResultWhereInput = {
      OR,
    };

    return baseFilter;
  }

  async writeFilter() {
    return false;
  }

  async decorate(doc: any) {
    doc._permissions = {
      view: true,
    };

    return doc;
  }
}
