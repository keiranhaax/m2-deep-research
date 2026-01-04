// src/components/header/StatusPill.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';

export type RequestStatus = 'idle' | 'streaming' | 'aborted' | 'error';

export function StatusPill({ status, theme }: { status: RequestStatus; theme: Theme }) {
  const color =
    status === 'streaming' ? theme.accent :
    status === 'aborted' ? theme.dim :
    status === 'error' ? theme.error :
    theme.subtle;

  return (
    <Box borderStyle="round" borderColor={color} paddingX={1}>
      <Text color={color}>{status.toUpperCase()}</Text>
    </Box>
  );
}
