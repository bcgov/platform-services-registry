import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { Session } from 'next-auth';
import { ModelService } from '@/core/model-service';

export class UserService extends ModelService<Prisma.UserWhereInput> {
  async readFilter() {
    let baseFilter!: Prisma.UserWhereInput;
    if (!this.session.isAdmin) {
      baseFilter = {
        OR: [
          { email: this.session.userId as string },
          { ministry: { in: this.session.ministries.admin as $Enums.Ministry[] } },
          { ministry: { in: this.session.ministries.readonly as $Enums.Ministry[] } },
        ],
      };
    }

    return baseFilter;
  }

  async writeFilter() {
    let baseFilter!: Prisma.UserWhereInput;
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
