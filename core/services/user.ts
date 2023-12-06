import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { Session } from 'next-auth';
import { ModelService } from '../modelService';

export class UserService extends ModelService<Prisma.UserWhereInput> {
  async secureFilter() {
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

  async decorate(doc: any) {
    doc._permissions = {
      view: true,
    };

    return doc;
  }
}
