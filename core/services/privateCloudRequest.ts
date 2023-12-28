import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { ModelService } from '../modelService';
import prisma from '@/lib/prisma';

export class PrivateCloudRequestService extends ModelService<Prisma.PrivateCloudRequestWhereInput> {
  async readFilter() {
    let baseFilter!: Prisma.PrivateCloudRequestWhereInput;

    if (!this.session) return false;
    if (!this.session.isAdmin) {
      const res = await prisma.privateCloudRequestedProject.findMany({
        select: { id: true },
      });

      const ids = res.map(({ id }) => id);

      baseFilter = {
        requestedProjectId: { in: ids },
      };
    }

    return baseFilter;
  }

  async writeFilter() {
    let baseFilter!: Prisma.PrivateCloudRequestWhereInput;

    if (!this.session?.isAdmin) {
      return false;
    }

    return baseFilter;
  }

  async decorate(doc: any) {
    doc._permissions = {
      view: true,
    };

    return doc;
  }
}
