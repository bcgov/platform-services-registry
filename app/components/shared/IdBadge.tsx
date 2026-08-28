import { Badge } from '@mantine/core';
import CopyableButton from '@/components/generic/button/CopyableButton';

export default function IdBadge({ id }: Readonly<{ id: string }>) {
  return (
    <CopyableButton value={id} className="pl-1">
      <Badge color="purple" radius="sm" className="cursor-pointer">
        ID {id.slice(0, 3)}...{id.slice(-2)}
      </Badge>
    </CopyableButton>
  );
}
