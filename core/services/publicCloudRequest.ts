import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { Session } from 'next-auth';
import { ModelService } from '../modelService';

export class PublicCloudRequestService extends ModelService<Prisma.PublicCloudRequestWhereInput> {
  async readFilter() {
    let baseFilter!: Prisma.PublicCloudRequestWhereInput;
    if (!this.session.isAdmin) {
      const res = await this.client.publicCloudRequestedProject.findMany({
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
    if (!this.session.isAdmin) {
      baseFilter = {
        // Adding a dummy query to ensure no documents match
        created: new Date(),
      };
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
