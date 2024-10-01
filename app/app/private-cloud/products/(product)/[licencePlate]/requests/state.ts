import { proxy } from 'valtio';
import { deepClone } from 'valtio/utils';
import { requestSortsInProduct } from '@/constants';
import { PrivateCloudRequestSearchBody } from '@/validation-schemas/private-cloud';

const initialValue = {
  search: '',
  page: 1,
  pageSize: 10,
  ministries: [],
  clusters: [],
  temporary: [],
  status: [],
  types: [],
  sortValue: requestSortsInProduct[0].label,
  sortKey: requestSortsInProduct[0].sortKey,
  sortOrder: requestSortsInProduct[0].sortOrder,
};

export const pageState = proxy<PrivateCloudRequestSearchBody>(deepClone(initialValue));

export function resetState() {
  const resetObj = deepClone(initialValue);
  pageState.search = resetObj.search;
  pageState.page = resetObj.page;
  pageState.pageSize = resetObj.pageSize;
  pageState.ministries = resetObj.ministries;
  pageState.clusters = resetObj.clusters;
  pageState.temporary = resetObj.temporary;
  pageState.status = resetObj.status;
  pageState.types = resetObj.types;
  pageState.sortValue = resetObj.sortValue;
  pageState.sortKey = resetObj.sortKey;
  pageState.sortOrder = resetObj.sortOrder;
}
