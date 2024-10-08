export async function genReadFilter<
  T extends {
    AND?: T | T[];
    OR?: T[];
    NOT?: T | T[];
  },
>(where: T, baseFilterFn: () => Promise<T | boolean>) {
  const baseFilter: T | boolean = await baseFilterFn();

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
