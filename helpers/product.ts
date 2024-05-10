import { ministryOptions } from '@/constants';

export function ministryKeyToName(key: string) {
  return ministryOptions.find((item) => item.value === key)?.label ?? '';
}
