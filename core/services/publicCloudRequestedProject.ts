import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { ModelService } from '../model-service';

export class PublicCloudRequestedProjectService extends ModelService<Prisma.PublicCloudRequestedProjectWhereInput> {
  async readFilter() {
    if (!this.session) return false;
    if (this.session.isAdmin) return true;

    const baseFilter: Prisma.PublicCloudRequestedProjectWhereInput = {
      OR: [
        { projectOwnerId: this.session.userId as string },
        { primaryTechnicalLeadId: this.session.userId as string },
        { secondaryTechnicalLeadId: this.session.userId },
        { ministry: { in: this.session.ministries.admin as $Enums.Ministry[] } },
        { ministry: { in: this.session.ministries.readonly as $Enums.Ministry[] } },
      ],
    };

    return baseFilter;
  }

  async writeFilter() {
    let baseFilter!: Prisma.PublicCloudRequestedProjectWhereInput;

    if (!this.session?.isAdmin) {
      return false;
    }

    return baseFilter;
  }

  decorate(doc: any) {
    doc._permissions = {
      view: true,
    };

    return doc;
  }
}
