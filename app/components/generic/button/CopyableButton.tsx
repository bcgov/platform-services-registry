import { Tooltip, UnstyledButton } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconClipboardCopy } from '@tabler/icons-react';
import _isString from 'lodash-es/isString';
import _truncate from 'lodash-es/truncate';
import React from 'react';
import { cn } from '@/utils/js';

export default function CopyableButton({
  children,
  value,
  className = '',
  onClick,
  updateContent = false,
  trancatedLen,
}: {
  children?: React.ReactNode;
  value?: string;
  className?: string;
  onClick?: () => void;
  updateContent?: boolean;
  trancatedLen?: number;
}) {
  const clipboard = useClipboard({ timeout: 500 });

  let content = null;
  if (children) {
    content = (
      <div
        className={cn('flex', {
          'hover:underline': _isString(children),
        })}
      >
        {_isString(children) && trancatedLen ? _truncate(children, { length: trancatedLen }) : children}
        {_isString(children) && <IconClipboardCopy className="" />}
      </div>
    );
  } else {
    content = <IconClipboardCopy className="" />;
  }

  return (
    <Tooltip
      label={`${clipboard.copied ? 'Copied' : 'Copy'} ${trancatedLen ? children : ''}`}
      position="top"
      offset={10}
    >
      <UnstyledButton
        className={cn('inline-block', className)}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (onClick) {
            clipboard.copy(onClick());
          } else if (value) {
            clipboard.copy(value);
          } else if (_isString(children)) {
            clipboard.copy(children);
          }
        }}
      >
        {updateContent && clipboard.copied ? 'Copied' : content}
      </UnstyledButton>
    </Tooltip>
  );
}
