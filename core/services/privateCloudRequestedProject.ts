import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { Session } from 'next-auth';
import { ModelService } from '../modelService';

export class PrivateCloudRequestedProjectService extends ModelService<Prisma.PrivateCloudRequestedProjectWhereInput> {
  async secureFilter() {
    let baseFilter!: Prisma.PrivateCloudRequestedProjectWhereInput;
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

  async decorate(doc: any) {
    doc._permissions = {
      view: true,
    };

    return doc;
  }
}
