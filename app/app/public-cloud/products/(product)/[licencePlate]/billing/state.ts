import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';

const initialValue = {};

export const pageState = proxy<{}>(deepClone(initialValue));

export function resetState() {
  const resetObj = deepClone(initialValue);
}
