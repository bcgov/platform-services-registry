import { Tooltip, UnstyledButton } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconClipboardCopy } from '@tabler/icons-react';
import React from 'react';

export default function CopyableButton({ children, value }: { children: React.ReactNode; value?: string }) {
  const clipboard = useClipboard({ timeout: 500 });

  return (
    <Tooltip label={clipboard.copied ? 'Copied' : 'Copy code'} position="right" offset={10}>
      <UnstyledButton
        className="inline-block"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();

          clipboard.copy(value ?? String(children));
        }}
      >
        <div className="flex hover:underline">
          {children}
          <IconClipboardCopy className="" />
        </div>
      </UnstyledButton>
    </Tooltip>
  );
}
