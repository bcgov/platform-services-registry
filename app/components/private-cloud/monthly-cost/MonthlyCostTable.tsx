import SimpleTable from '@/components/generic/simple-table/SimpleTable';
import { getPeriodCostDetailTableDataRow } from '@/helpers/private-cloud';
import { PeriodCostItem, PeriodCosts } from '@/types/private-cloud';
import { CostDetailTableDataRow } from '@/types/private-cloud';
import { periodCostItemTableColumns, generateDailyCostDetailTableColumns } from '../costs';

export default function MonthlyCostTable({ data }: { data: PeriodCosts }) {
  const dailyCost = getPeriodCostDetailTableDataRow(data);

  return (
    <>
      <SimpleTable<PeriodCostItem>
        columns={periodCostItemTableColumns}
        data={data.items.filter((item) => item.isPast)}
      />
      <SimpleTable<CostDetailTableDataRow>
        columns={generateDailyCostDetailTableColumns(false)}
        data={dailyCost}
        className="mt-6"
      />
    </>
  );
}
