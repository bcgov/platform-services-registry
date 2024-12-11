import { Tooltip } from '@mantine/core';
import { IconInfoSquareRounded } from '@tabler/icons-react';
import _isString from 'lodash-es/isString';
import React from 'react';
import { cn } from '@/utils/js';

export default function InfoTooltip({ label, className }: { label: string; className?: string }) {
  return (
    <Tooltip label={label} offset={10}>
      <IconInfoSquareRounded
        stroke={1.5}
        color="var(--mantine-color-blue-filled)"
        className={cn('inline-block cursor-help mx-1', className)}
      />
    </Tooltip>
  );
}
