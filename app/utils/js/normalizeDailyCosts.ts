export interface MonthlyCostItem {
  startDate: string;
  endDate: string;
  cpuCores: number;
  storageGiB: number;
  cpuCost: string;
  storageCost: string;
  totalCost: string;
}

export interface NormalizedDailyCost {
  date: string;
  cpuCost: number;
  storageCost: number;
  totalCost: number;
}

export function normalizeDailyCosts(items: MonthlyCostItem[], startDate: Date, endDate: Date): NormalizedDailyCost[] {
  const dailyData: NormalizedDailyCost[] = [];
  let currentCpuCost = 0;
  let currentStorageCost = 0;
  let currentTotalCost = 0;

  const sortedItems = [...items].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  let itemIndex = 0;
  let currentItem = sortedItems[itemIndex];

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    while (currentItem && new Date(currentItem.startDate).getTime() <= d.getTime()) {
      currentCpuCost = parseFloat(currentItem.cpuCost);
      currentStorageCost = parseFloat(currentItem.storageCost);
      currentTotalCost = parseFloat(currentItem.totalCost);
      itemIndex++;
      currentItem = sortedItems[itemIndex];
    }

    dailyData.push({
      date: new Date(d).toLocaleDateString('en-CA'),
      cpuCost: currentCpuCost,
      storageCost: currentStorageCost,
      totalCost: currentTotalCost,
    });
  }

  return dailyData;
}
