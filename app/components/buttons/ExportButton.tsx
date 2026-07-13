'use client';

import { Button } from '@mantine/core';
import { IconCloudDownload } from '@tabler/icons-react';
import { useState } from 'react';
import { openNotificationModal } from '@/components/modal/notification';
import { instance } from '@/services/backend/axios';
import { downloadFile } from '@/utils/browser';
import { cn } from '@/utils/js';

// Parse a filename from a Content-Disposition header, preferring the RFC 5987 `filename*`
// form and falling back to a (possibly quoted) `filename`.
function parseContentDispositionFilename(disposition?: string): string | undefined {
  if (!disposition) return undefined;

  const extended = disposition.match(/filename\*=(?:UTF-8'')?([^;]+)/i);
  if (extended?.[1]) {
    try {
      return decodeURIComponent(extended[1].trim());
    } catch {
      return extended[1].trim();
    }
  }

  const basic = disposition.match(/filename="?([^";]+)"?/i);
  return basic?.[1]?.trim();
}

export default function ExportButton({
  onExport,
  className = '',
  downloadUrl,
}: {
  onExport?: () => Promise<boolean>;
  className?: string;
  downloadUrl?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const openNoContentModal = async () => {
    await openNotificationModal(
      { content: 'There is no data available for download.' },
      {
        settings: {
          title: 'Nothing to export',
          withCloseButton: true,
          closeOnClickOutside: true,
          closeOnEscape: true,
        },
      },
    );
  };

  return (
    <>
      <Button
        color="dark"
        variant="outline"
        leftSection={<IconCloudDownload />}
        className={cn('pr-6', className)}
        loading={isLoading}
        onClick={async () => {
          if (onExport) {
            setIsLoading(true);
            const success = await onExport();
            if (!success) {
              await openNoContentModal();
            }
            setIsLoading(false);
          } else if (downloadUrl) {
            setIsLoading(true);
            const defaultName = downloadUrl.includes('format=csv') ? 'data.csv' : 'data.xlsx';
            const success = await instance.get(downloadUrl, { responseType: 'blob' }).then((res) => {
              if (res.status === 204) return false;
              const disposition = res.headers?.['content-disposition'] as string | undefined;
              const filename = parseContentDispositionFilename(disposition) ?? defaultName;
              downloadFile(res.data, filename, res.headers);
              return true;
            });

            if (!success) {
              await openNoContentModal();
            }
            setIsLoading(false);
          }
        }}
      >
        Export
      </Button>
    </>
  );
}
