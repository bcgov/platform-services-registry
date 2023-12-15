import { Prisma, PrismaClient, $Enums } from '@prisma/client';
import { Session } from 'next-auth';

export abstract class ModelService<TFilter> {
  abstract readFilter(): Promise<TFilter>;
  abstract writeFilter(): Promise<TFilter>;
  abstract decorate(doc: any): Promise<any>;

  protected client!: PrismaClient;

  protected session!: Session;

  constructor(client: PrismaClient, session: Session) {
    this.client = client;
    this.session = session;
  }

  async genFilter(where: TFilter, mode: 'read' | 'write') {
    let filter = where;

    const baseFilterFn = mode === 'read' ? this.readFilter : this.writeFilter;
    const baseFilter = await baseFilterFn();

    if (baseFilter) {
      if (where) {
        filter = { AND: [baseFilter, where] } as TFilter;
      } else {
        filter = baseFilter;
      }
    }

    return filter;
  }
}
