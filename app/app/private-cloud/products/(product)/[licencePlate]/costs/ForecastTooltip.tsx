import { HoverCard, Group, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { cn } from '@/utils/js';

export default function ForecastTooltip({ children }: { children: React.ReactNode }) {
  const [, { close, open }] = useDisclosure(false);

  return (
    <Group justify="left">
      <HoverCard shadow="md" position="top">
        <HoverCard.Target>
          <UnstyledButton className={cn('cursor-help')} onMouseEnter={open} onMouseLeave={close}>
            {children}
          </UnstyledButton>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <div className="max-w-lg">
            <h3 className="font-semibold text-xl mb-1">Forecasted cost</h3>
            <p>
              This estimate is based on the current resource quotas (CPU, Storage) allocated to this product and the
              unit costs, defined by administrators, for upcoming dates.
            </p>
          </div>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}
