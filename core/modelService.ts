import { Session } from 'next-auth';

export abstract class ModelService<TFilter> {
  abstract readFilter(): Promise<TFilter | boolean>;
  abstract writeFilter(): Promise<TFilter | boolean>;
  abstract decorate(doc: any): Promise<any>;

  protected session!: Session;

  constructor(session: Session) {
    this.session = session;
  }

  async genFilter(where: TFilter, mode: 'read' | 'write') {
    const baseFilterFn = mode === 'read' ? this.readFilter.bind(this) : this.writeFilter.bind(this);
    const baseFilter = await baseFilterFn();

    if (baseFilter === true) {
      return where;
    }

    if (baseFilter === false) {
      return false;
    }

    if (baseFilter) {
      if (where) {
        return { AND: [baseFilter, where] };
      }

      return baseFilter;
    }

    return where;
  }
}
