import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { Session } from 'next-auth';

export abstract class ModelService<TFilter> {
  abstract secureFilter(): Promise<TFilter>;
  abstract decorate(doc: any): Promise<any>;

  protected client!: PrismaClient;

  protected session!: Session;

  constructor(client: PrismaClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  async genFilter(where: TFilter) {
    let filter = where;

    const secureFilter = await this.secureFilter();

    if (secureFilter) {
      if (where) {
        filter = { AND: [secureFilter, where] } as TFilter;
      } else {
        filter = secureFilter;
      }
    }

    return filter;
  }
}
