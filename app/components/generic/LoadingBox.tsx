import { Box, LoadingOverlay } from '@mantine/core';
import { ReactNode } from 'react';

export default function LoadingBox({ children, isLoading = false }: { children: ReactNode; isLoading?: boolean }) {
  return (
    <Box pos="relative">
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
