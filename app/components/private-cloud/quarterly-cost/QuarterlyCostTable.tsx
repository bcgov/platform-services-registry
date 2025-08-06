import SimpleTable from '@/components/generic/simple-table/SimpleTable';
import { getPeriodCostDetailTableDataRow } from '@/helpers/private-cloud';
import { PeriodCostItem, PeriodCosts } from '@/types/private-cloud';
import { CostDetailTableDataRow } from '@/types/private-cloud';
import { periodCostItemTableColumns, generateMonthlyCostDetailTableColumns } from '../costs';

export default function QuarterlyCostTable({ data }: { data: PeriodCosts }) {
  const monthlyCost = getPeriodCostDetailTableDataRow(data);
  
  return (
    <>
      <SimpleTable<PeriodCostItem>
        columns={periodCostItemTableColumns}
        data={data.items.filter((item) => item.isPast)}
      />
      <SimpleTable<CostDetailTableDataRow>
        columns={generateMonthlyCostDetailTableColumns(false)}
        data={monthlyCost}
        className="mt-6"
      />
    </>
  );
}
