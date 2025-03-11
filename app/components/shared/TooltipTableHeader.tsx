import { Table, Tooltip } from '@mantine/core';

export default function TooltipTableHeader({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip label={label}>
      <Table.Th>{children}</Table.Th>
    </Tooltip>
  );
}
