import { Group, Text } from '@mantine/core';
import { IconProps } from '@tabler/icons-react';

export interface AccordionLabelProps {
  label: string;
  LeftIcon: React.ComponentType<IconProps>;
  description: string;
  invalid?: boolean;
}

export function AccordionLabel({ label, LeftIcon, description, invalid }: Readonly<AccordionLabelProps>) {
  return (
    <Group wrap="nowrap">
      <LeftIcon className="inline-block" />
      <div>
        <Text size="lg" fw={600} c={invalid ? 'red' : undefined}>
          {label}
        </Text>
        <Text size="sm" c={invalid ? 'red' : 'dimmed'} fw={invalid ? 600 : 400}>
          {description}
        </Text>
      </div>
    </Group>
  );
}
