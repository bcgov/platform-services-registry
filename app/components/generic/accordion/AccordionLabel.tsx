import { Group, Text } from '@mantine/core';
import { IconProps } from '@tabler/icons-react';

export interface AccordionLabelProps {
  label: string;
  LeftIcon: React.ComponentType<IconProps>;
  description: string;
}

export function AccordionLabel({ label, LeftIcon, description }: AccordionLabelProps) {
  return (
    <Group wrap="nowrap">
      <LeftIcon className="inline-block" />
      <div>
        <Text size="lg" fw={600}>
          {label}
        </Text>
        <Text size="sm" c="dimmed" fw={400}>
          {description}
        </Text>
      </div>
    </Group>
  );
}
