import { Tooltip, UnstyledButton } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconClipboardCopy } from '@tabler/icons-react';
import classNames from 'classnames';
import _isString from 'lodash/isString';
import React from 'react';

export default function CopyableButton({ children, value }: { children: React.ReactNode; value?: string }) {
  const clipboard = useClipboard({ timeout: 500 });

  return (
    <Tooltip label={clipboard.copied ? 'Copied' : 'Copy'} position="top" offset={10}>
      <UnstyledButton
        className="inline-block"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();

          clipboard.copy(value ?? String(children));
        }}
      >
        <div
          className={classNames('flex', {
            'hover:underline': _isString(children),
          })}
        >
          {children}
          {_isString(children) && <IconClipboardCopy className="" />}
        </div>
      </UnstyledButton>
    </Tooltip>
  );
}
