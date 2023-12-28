import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import prisma from '@/lib/prisma';
import { ModelService } from '../modelService';

export class PrivateCloudProjectZapResultService extends ModelService<Prisma.PrivateCloudProjectZapResultWhereInput> {
  async readFilter() {
    let baseFilter!: Prisma.PrivateCloudProjectZapResultWhereInput;

    if (!this.session) return false;
    if (!this.session.isAdmin) {
      const res = await prisma.privateCloudRequestedProject.findMany({
        select: { cluster: true, licencePlate: true },
      });

      baseFilter = {
        OR: res.map(({ cluster, licencePlate }) => ({ cluster, licencePlate })),
      };
    }

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
