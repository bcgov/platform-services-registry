import { Tooltip, TooltipProps } from '@mantine/core';
import _truncate from 'lodash-es/truncate';
import React from 'react';

type TruncatedTooltipProps = TooltipProps & {
  label: string | React.ReactNode;
  maxLength?: number;
  maxWidth?: number;
};

function TruncatedTooltip({
  label,
  maxLength = 300,
  maxWidth = 400,
  children,
  ...tooltipProps
}: TruncatedTooltipProps) {
  const isStringLabel = typeof label === 'string';

  return (
    <Tooltip
      label={
        isStringLabel ? (
          <div className="tooltip-content max-w-[400px] whitespace-pre-wrap break-words">
            {_truncate(label as string, { length: maxLength })}
          </div>
        ) : (
          label
        )
      }
      offset={10}
      position="top-start"
      withArrow
      {...tooltipProps}
    >
      {children}
    </Tooltip>
  );
}

export default TruncatedTooltip;
