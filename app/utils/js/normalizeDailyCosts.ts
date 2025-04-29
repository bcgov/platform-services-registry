import _orderBy from 'lodash-es/orderBy';

export interface NormalizedDailyCost {
  day: string;
  cpuCost: number;
  storageCost: number;
  totalCost: number;
}

interface InputItem {
  startDate: string;
  cpuCost: number;
  storageCost: number;
  totalCost: number;
}

export function normalizeDailyCosts(items: InputItem[], startDate: Date, endDate: Date): NormalizedDailyCost[] {
  const sortedItems = _orderBy(items, (item) => new Date(item.startDate).getTime(), 'asc');

  const dailyData: NormalizedDailyCost[] = [];
  let itemIndex = 0;
  let currentItem = sortedItems[itemIndex];
  let currentCpuCost = 0;
  let currentStorageCost = 0;

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    while (currentItem && new Date(currentItem.startDate).getTime() <= d.getTime()) {
      currentCpuCost = currentItem.cpuCost;
      currentStorageCost = currentItem.storageCost;
      itemIndex++;
      currentItem = sortedItems[itemIndex];
    }

    const totalCost = currentCpuCost + currentStorageCost;

    dailyData.push({
      day: d.getDate().toString(),
      cpuCost: currentCpuCost,
      storageCost: currentStorageCost,
      totalCost,
    });
  }

  return dailyData;
}
