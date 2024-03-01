import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import prisma from '@/core/prisma';
import { ModelService } from '../model-service';

export class PrivateCloudProjectZapResultService extends ModelService<Prisma.PrivateCloudProjectZapResultWhereInput> {
  async readFilter() {
    if (!this.session) return false;
    if (this.session.isAdmin) return true;

    const res = await prisma.privateCloudProject.findMany({
      select: { cluster: true, licencePlate: true },
      session: this.session as never,
    });

    if (res.length === 0) return false;

    const baseFilter: Prisma.PrivateCloudProjectZapResultWhereInput = {
      OR: res.map(({ cluster, licencePlate }) => ({ cluster, licencePlate })),
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
