import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { ModelService } from '../model-service';
import prisma from '@/core/prisma';

export class PrivateCloudRequestService extends ModelService<Prisma.PrivateCloudRequestWhereInput> {
  async readFilter() {
    if (!this.session) return false;
    if (this.session.isAdmin) return true;

    const res = await prisma.privateCloudRequestedProject.findMany({
      select: { id: true },
      session: this.session as never,
    });

    const ids = res.map(({ id }) => id);

    const baseFilter: Prisma.PrivateCloudRequestWhereInput = {
      requestedProjectId: { in: ids },
    };

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
