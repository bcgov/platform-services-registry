import { ReadonlyURLSearchParams } from 'next/navigation';

export default function createQueryString(
  params: Record<string, string | number | null>,
  searchParams: ReadonlyURLSearchParams,
) {
  const newSearchParams = new URLSearchParams(searchParams?.toString());

  for (const [key, value] of Object.entries(params)) {
    if (value === null) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, String(value));
    }
  }

  return newSearchParams.toString();
}
