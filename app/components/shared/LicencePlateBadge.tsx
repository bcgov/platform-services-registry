import { Badge } from '@mantine/core';
import CopyableButton from '@/components/generic/button/CopyableButton';

export default function LicencePlateBadge({ licencePlate }: { licencePlate: string }) {
  return (
    <CopyableButton value={licencePlate}>
      <Badge color="gray" radius="sm" className="cursor-pointer">
        {licencePlate}
      </Badge>
    </CopyableButton>
  );
}
