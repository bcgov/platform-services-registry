import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { Session } from 'next-auth';
import { ModelService } from '../modelService';

export class PrivateCloudProjectService extends ModelService<Prisma.PrivateCloudProjectWhereInput> {
  async readFilter() {
    let baseFilter!: Prisma.PrivateCloudProjectWhereInput;
    if (!this.session.isAdmin) {
      baseFilter = {
        OR: [
          { projectOwnerId: this.session.userId as string },
          { primaryTechnicalLeadId: this.session.userId as string },
          { secondaryTechnicalLeadId: this.session.userId },
          { ministry: { in: this.session.ministries.admin as $Enums.Ministry[] } },
          { ministry: { in: this.session.ministries.readonly as $Enums.Ministry[] } },
        ],
      };
    }

    return baseFilter;
  }

  async writeFilter() {
    let baseFilter!: Prisma.PrivateCloudProjectWhereInput;
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
