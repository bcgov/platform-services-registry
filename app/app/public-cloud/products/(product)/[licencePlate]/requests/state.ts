import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { requestSorts } from '@/constants';
import { PublicCloudRequestSearchBody } from '@/validation-schemas/public-cloud';

const initialValue = {
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  providers: [],
  status: [],
  types: [],
  sortValue: requestSorts[0].label,
  sortKey: requestSorts[0].sortKey,
  sortOrder: requestSorts[0].sortOrder,
};

export const pageState = proxy<PublicCloudRequestSearchBody>(deepClone(initialValue));

export function resetState() {
  const resetObj = deepClone(initialValue);
  pageState.search = resetObj.search;
  pageState.page = resetObj.page;
  pageState.pageSize = resetObj.pageSize;
  pageState.ministries = resetObj.ministries;
  pageState.providers = resetObj.providers;
  pageState.status = resetObj.status;
  pageState.types = resetObj.types;
  pageState.sortValue = resetObj.sortValue;
  pageState.sortKey = resetObj.sortKey;
  pageState.sortOrder = resetObj.sortOrder;
}
