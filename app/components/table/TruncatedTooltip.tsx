import { Tooltip } from '@mantine/core';
import _truncate from 'lodash-es/truncate';
import React from 'react';

interface TruncatedTooltipProps {
  label: string;
  maxLength?: number;
  children: React.ReactNode;
}

const TruncatedTooltip: React.FC<TruncatedTooltipProps> = ({ label, maxLength = 300, children }) => {
  return (
    <Tooltip
      label={
        <div className="whitespace-pre-wrap break-words max-w-[400px]">{_truncate(label, { length: maxLength })}</div>
      }
      offset={10}
      position="top-start"
      withArrow
    >
      {children}
    </Tooltip>
  );
};

export default TruncatedTooltip;
