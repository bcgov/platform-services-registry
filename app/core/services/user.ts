import { Prisma, $Enums } from '@prisma/client';
import { ModelService } from '@/core/model-service';

export class UserService extends ModelService<Prisma.UserWhereInput> {
  async readFilter() {
    let baseFilter!: Prisma.UserWhereInput;
    if (!this.session.isAdmin) {
      baseFilter = {
        OR: [
          { email: this.session.userId as string },
          { ministry: { in: this.session.ministries.editor as $Enums.Ministry[] } },
          { ministry: { in: this.session.ministries.reader as $Enums.Ministry[] } },
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
        createdAt: new Date(),
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
