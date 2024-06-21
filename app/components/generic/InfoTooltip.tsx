import { Tooltip } from '@mantine/core';
import { IconInfoSquareRounded } from '@tabler/icons-react';
import classNames from 'classnames';
import _isString from 'lodash/isString';
import React from 'react';

export default function InfoTooltip({ label, className }: { label: string; className?: string }) {
  return (
    <Tooltip label={label} offset={10}>
      <IconInfoSquareRounded
        stroke={1.5}
        color="var(--mantine-color-blue-filled)"
        className={classNames('inline-block cursor-help mx-1', className)}
      />
    </Tooltip>
  );
}
