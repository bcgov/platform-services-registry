import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import prisma from '@/lib/prisma';
import { ModelService } from '../modelService';

export class PublicCloudRequestService extends ModelService<Prisma.PublicCloudRequestWhereInput> {
  async readFilter() {
    let baseFilter!: Prisma.PublicCloudRequestWhereInput;

    if (!this.session) return false;
    if (!this.session.isAdmin) {
      const res = await prisma.publicCloudRequestedProject.findMany({
        select: { id: true },
        session: this.session as never,
      });

      const ids = res.map(({ id }) => id);

      baseFilter = {
        requestedProjectId: { in: ids },
      };
    }

    return baseFilter;
  }

  async writeFilter() {
    let baseFilter!: Prisma.PublicCloudRequestWhereInput;

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
