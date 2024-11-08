import { Session } from 'next-auth';

export async function genBaseFilter<
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
export type CreateResult<TData, TArgs> = { data: TData; args: TArgs };
export type ListResult<TData, TArgs> = {
  data: TData[];
  args: TArgs;
  totalCount: number;
};
export type CountResult<TArgs> = { data: number; args: TArgs };

type CreateArgs = {
  select?: any | null;
  include?: any | null;
  data: any;
};

type ReadArgs = {
  select?: any | null;
  include?: any | null;
  where?: any;
  orderBy?: any | any[];
  cursor?: any;
  take?: number;
  skip?: number;
  distinct?: any | any[];
};

type UpdateArgs = {
  select?: any | null;
  include?: any | null;
  data: any;
  where?: any;
  options?: {
    skipPermissionCheck?: boolean;
  };
};

type UpsertArgs = {
  select?: any;
  include?: any;
  where?: any;
  create?: any;
  update?: any;
};

type Decoration = {
  _permissions: {
    view: boolean;
    edit: boolean;
    delete: boolean;
  };
};

// Factory function for creating session models
export function createSessionModel<
  TSimple,
  TDetail,
  TSimpleDecorated extends Decoration,
  TDetailDecorated extends Decoration,
  TCreateArgs extends CreateArgs,
  TReadArgs extends ReadArgs,
  TUpdateArgs extends UpdateArgs,
  TUpsertArgs extends UpsertArgs,
>({
  model,
  includeDetail,
  includeSimple,
  baseFilter,
  decorate,
}: {
  model: any;
  includeDetail?: object;
  includeSimple?: object;
  baseFilter: any;
  decorate: (data: any, session: Session, detail: boolean) => Promise<any>;
}) {
  // Helper function to handle filtering
  async function applyFilter<T extends { where?: any }>(args: T, session?: Session): Promise<T> {
    if (!session) return args;

    const filter = await genBaseFilter(args.where || {}, baseFilter, session);
    if (filter === false) return { ...args, where: false };

    return { ...args, where: filter };
  }

  // Overloaded method signatures for getItem
  async function getItem(args: TReadArgs, session: Session): Promise<ReadResult<TDetailDecorated, TReadArgs>>;
  async function getItem(args: TReadArgs): Promise<ReadResult<TDetail, TReadArgs>>;
  async function getItem(
    { where = {}, select, ...otherArgs }: TReadArgs,
    session?: Session,
  ): Promise<ReadResult<TDetail | TDetailDecorated, TReadArgs>> {
    let finalArgs = { where, ...otherArgs } as TReadArgs;

    finalArgs = await applyFilter<TReadArgs>(finalArgs, session);

    if (select) {
      finalArgs.select = select;
    } else {
      finalArgs.include = includeDetail;
    }

    const data = await model.findFirst(finalArgs);

    if (session && data && !select) {
      const decoratedData = await decorate(data, session, true);
      return { data: decoratedData, args: finalArgs };
    }

    return { data, args: finalArgs };
  }

  // Overloaded method signatures for listItems
  async function listItems(args: TReadArgs & { includeCount?: boolean }): Promise<ListResult<TSimple, TReadArgs>>;
  async function listItems(
    args: TReadArgs & { includeCount?: boolean },
    session: Session,
  ): Promise<ListResult<TSimpleDecorated, TReadArgs>>;
  async function listItems(
    { where = {}, select, includeCount, ...otherArgs }: TReadArgs & { includeCount?: boolean },
    session?: Session,
  ): Promise<ListResult<TSimple | TSimpleDecorated, TReadArgs>> {
    let finalArgs = { where, ...otherArgs } as TReadArgs;

    finalArgs = await applyFilter<TReadArgs>(finalArgs, session);

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
      const decoratedData = await Promise.all(data.map((item: TSimple) => decorate(item, session, false)));
      return { data: decoratedData, args: finalArgs, totalCount };
    }

    return { data, args: finalArgs, totalCount };
  }

  // Overloaded method signatures for countItems
  async function countItems(args: Pick<TReadArgs, 'where'>): Promise<CountResult<Pick<TReadArgs, 'where'>>>;
  async function countItems(
    args: Pick<TReadArgs, 'where'>,
    session: Session,
  ): Promise<CountResult<Pick<TReadArgs, 'where'>>>;
  async function countItems(
    { where = {}, ...otherArgs }: Pick<TReadArgs, 'where'>,
    session?: Session,
  ): Promise<CountResult<Pick<TReadArgs, 'where'>>> {
    const finalArgs = await applyFilter<TReadArgs>({ where, ...otherArgs } as TReadArgs, session);

    return { data: await model.count(finalArgs), args: finalArgs };
  }

  // Overloaded method signatures for createItem
  async function createItem(args: TCreateArgs, session: Session): Promise<CreateResult<TDetailDecorated, TCreateArgs>>;
  async function createItem(args: TCreateArgs): Promise<CreateResult<TDetail, TCreateArgs>>;
  async function createItem(
    { select, ...otherArgs }: TCreateArgs,
    session?: Session,
  ): Promise<CreateResult<TDetail | TDetailDecorated, TCreateArgs>> {
    const finalArgs = { ...otherArgs } as TCreateArgs;
    if (select) {
      finalArgs.select = select;
    } else {
      finalArgs.include = includeDetail;
    }

    const data = await model.create(finalArgs);

    if (session && data && !select) {
      const decoratedData = await decorate(data, session, true);
      return { data: decoratedData, args: finalArgs };
    }

    return { data, args: finalArgs };
  }

  // Overloaded method signatures for updateItem
  async function updateItem(args: TUpdateArgs, session: Session): Promise<ReadResult<TDetailDecorated, TUpdateArgs>>;
  async function updateItem(args: TUpdateArgs): Promise<ReadResult<TDetail, TUpdateArgs>>;
  async function updateItem(
    { where = {}, select, options, ...otherArgs }: TUpdateArgs,
    session?: Session,
  ): Promise<ReadResult<TDetail | TDetailDecorated, TUpdateArgs>> {
    const { skipPermissionCheck = false } = options ?? {};
    const finalArgs = { where, ...otherArgs } as TUpdateArgs;

    if (session && !skipPermissionCheck) {
      const item = await getItem({ where } as TReadArgs, session);
      if (!item.data?._permissions.edit) return { data: null, args: finalArgs };

      finalArgs.where = item.args.where;
    }

    if (select) {
      finalArgs.select = select;
    } else {
      finalArgs.include = includeDetail;
    }

    const data = await model.update(finalArgs);

    if (session && data && !select) {
      const decoratedData = await decorate(data, session, true);
      return { data: decoratedData, args: finalArgs };
    }

    return { data, args: finalArgs };
  }

  // Overloaded method signatures for upsertItem
  async function upsertItem(args: TUpsertArgs, session: Session): Promise<ReadResult<TDetailDecorated, TUpsertArgs>>;
  async function upsertItem(args: TUpsertArgs): Promise<ReadResult<TDetail, TUpsertArgs>>;
  async function upsertItem(
    { where = {}, select, ...otherArgs }: TUpsertArgs,
    session?: Session,
  ): Promise<ReadResult<TDetail | TDetailDecorated, TUpsertArgs>> {
    const finalArgs = { where, ...otherArgs } as TUpsertArgs;

    const one = await model.findFirst(finalArgs);
    // Update document
    if (one) {
      const updateArgs = { where, select, include: otherArgs.include, data: otherArgs.update } as TUpdateArgs;
      const result = session ? await updateItem(updateArgs, session) : await updateItem(updateArgs);

      return {
        data: result.data,
        args: {
          ...finalArgs,
          select: result.args.select,
          include: result.args.include,
          where: result.args.where,
        },
      };
    }

    // Create document
    const createArgs = { select, include: otherArgs.include, data: otherArgs.create } as TCreateArgs;
    const result = session ? await createItem(createArgs, session) : await createItem(createArgs);

    return {
      data: result.data,
      args: {
        ...finalArgs,
        select: result.args.select,
        include: result.args.include,
      },
    };
  }

  async function decorateItem(data: any, session: Session, detail = true): Promise<TDetailDecorated> {
    const decoratedData = await decorate(data, session, detail);
    return decoratedData;
  }

  return {
    get: getItem,
    list: listItems,
    count: countItems,
    create: createItem,
    update: updateItem,
    upsert: upsertItem,
    decorate: decorateItem,
  };
}
