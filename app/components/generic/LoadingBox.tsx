import { Box, LoadingOverlay } from '@mantine/core';
import { ReactNode } from 'react';
import { cn } from '@/utils/js';

export default function LoadingBox({
  children,
  isLoading = false,
  className,
}: {
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}) {
  return (
    <Box pos="relative" className={cn(className)}>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'pink', type: 'bars' }}
      />
      {children}
    </Box>
  );
}
