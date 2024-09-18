import { Alert, Group, Avatar, Text, Accordion, Table, Badge, Button } from '@mantine/core';
import { IconProps, Icon } from '@tabler/icons-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

export interface AccordionLabelProps {
  label: string;
  LeftIcon: ForwardRefExoticComponent<Omit<IconProps, 'ref'> & RefAttributes<Icon>>;
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
