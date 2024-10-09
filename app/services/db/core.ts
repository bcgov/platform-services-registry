import { Session } from 'next-auth';

export async function genReadFilter<
  T extends {
    AND?: T | T[];
    OR?: T[];
    NOT?: T | T[];
  },
>(where: T, baseFilterFn: (sessoin: Session) => Promise<T | boolean>, sessoin: Session) {
  const baseFilter: T | boolean = await baseFilterFn(sessoin);

  if (baseFilter === true) {
    return where;
  }

  if (baseFilter === false) {
    return false;
  }

  if (baseFilter) {
    if (where) {
      if (where.AND) {
        return { AND: [baseFilter, where] };
      }

      return { ...where, AND: [baseFilter] };
    }

    return baseFilter;
  }

  return where;
}

export type ReadResult<TData, TArgs> = { data: TData | null; args: TArgs };
export type ListResult<TData, TArgs> = {
  data: TData[];
  args: TArgs;
  totalCount: number;
};
export type CountResult<TArgs> = { data: number; args: TArgs };

type FindArgs = {
  select?: any | null;
  include?: any | null;
  where?: any;
  orderBy?: any | any[];
  cursor?: any;
  take?: number;
  skip?: number;
  distinct?: any | any[];
};

type UpsertArgs = {
  select?: any;
  include?: any;
  where?: any;
  create?: any;
  update?: any;
};

// Factory function for creating session models
export function createSessionModel<
  TDetail,
  TDecoratedDetail,
  TSimple,
  TDecoratedSimple,
  TFindArgs extends FindArgs,
  TUpsertArgs extends UpsertArgs,
>({
  model,
  includeDetail,
  includeSimple,
  readFilter,
  decorate,
}: {
  model: any;
  includeDetail?: object;
  includeSimple?: object;
  readFilter: any;
  decorate: (data: any, session: Session) => Promise<any>;
}) {
  // Helper function to handle filtering
  async function applyFilter<T extends { where?: any }>(args: T, session?: Session): Promise<T> {
    if (!session) return args;

    const filter = await genReadFilter(args.where || {}, readFilter, session);
    if (filter === false) return { ...args, where: false };

    return { ...args, where: filter };
  }

  // Overloaded method signatures for getItem
  async function getItem(args: TFindArgs, session: Session): Promise<ReadResult<TDecoratedDetail, TFindArgs>>;
  async function getItem(args: TFindArgs): Promise<ReadResult<TDetail, TFindArgs>>;
  async function getItem(
    { where = {}, select, ...otherArgs }: TFindArgs,
    session?: Session,
  ): Promise<ReadResult<TDetail | TDecoratedDetail, TFindArgs>> {
    let finalArgs = { where, ...otherArgs } as TFindArgs;

    finalArgs = await applyFilter<TFindArgs>(finalArgs, session);

    if (select) {
      finalArgs.select = select;
    } else {
      finalArgs.include = includeDetail;
    }

    const data = await model.findFirst(finalArgs);

    if (session && data && !select) {
      const decoratedData = await decorate(data, session);
      return { data: decoratedData, args: finalArgs };
    }

    return { data, args: finalArgs };
  }

  // Overloaded method signatures for listItems
  async function listItems(args: TFindArgs & { includeCount?: boolean }): Promise<ListResult<TSimple, TFindArgs>>;
  async function listItems(
    args: TFindArgs & { includeCount?: boolean },
    session: Session,
  ): Promise<ListResult<TDecoratedSimple, TFindArgs>>;
  async function listItems(
    { where = {}, select, includeCount, ...otherArgs }: TFindArgs & { includeCount?: boolean },
    session?: Session,
  ): Promise<ListResult<TSimple | TDecoratedSimple, TFindArgs>> {
    let finalArgs = { where, ...otherArgs } as TFindArgs;

    finalArgs = await applyFilter<TFindArgs>(finalArgs, session);

    if (select) {
      finalArgs.select = select;
    } else {
      finalArgs.include = includeSimple;
    }

    const [data, totalCount] = await Promise.all([
      model.findMany(finalArgs),
      includeCount ? model.count({ where: finalArgs.where }) : 0,
    ]);

    if (session && !select) {
      const decoratedData = await Promise.all(data.map((item: TSimple) => decorate(item, session)));
      return { data: decoratedData, args: finalArgs, totalCount };
    }

    return { data, args: finalArgs, totalCount };
  }

  // Overloaded method signatures for countItems
  async function countItems(args: Pick<TFindArgs, 'where'>): Promise<CountResult<Pick<TFindArgs, 'where'>>>;
  async function countItems(
    args: Pick<TFindArgs, 'where'>,
    session: Session,
  ): Promise<CountResult<Pick<TFindArgs, 'where'>>>;
  async function countItems(
    { where = {}, ...otherArgs }: Pick<TFindArgs, 'where'>,
    session?: Session,
  ): Promise<CountResult<Pick<TFindArgs, 'where'>>> {
    const finalArgs = await applyFilter<TFindArgs>({ where, ...otherArgs } as TFindArgs, session);

    return { data: await model.count(finalArgs), args: finalArgs };
  }

  // Overloaded method signatures for upsertItem
  async function upsertItem(args: TUpsertArgs, session: Session): Promise<ReadResult<TDecoratedDetail, TUpsertArgs>>;
  async function upsertItem(args: TUpsertArgs): Promise<ReadResult<TDetail, TUpsertArgs>>;
  async function upsertItem(
    { where = {}, select, ...otherArgs }: TUpsertArgs,
    session?: Session,
  ): Promise<ReadResult<TDetail | TDecoratedDetail, TUpsertArgs>> {
    let finalArgs = { where, ...otherArgs } as TUpsertArgs;

    finalArgs = await applyFilter<TUpsertArgs>(finalArgs, session);

    if (select) {
      finalArgs.select = select;
    } else {
      finalArgs.include = includeDetail;
    }

    const data = await model.upsert(finalArgs);

    if (session && data && !select) {
      const decoratedData = await decorate(data, session);
      return { data: decoratedData, args: finalArgs };
    }

    return { data, args: finalArgs };
  }

  return {
    get: getItem,
    list: listItems,
    count: countItems,
    upsert: upsertItem,
  };
}
