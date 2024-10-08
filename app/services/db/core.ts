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
