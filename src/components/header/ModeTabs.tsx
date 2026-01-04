// src/components/header/ModeTabs.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';

export type Mode = 'chat' | 'plan' | 'research';

function Tab({ label, active, theme }: { label: string; active: boolean; theme: Theme }) {
  return (
    <Box
      borderStyle={active ? 'single' : undefined}
      borderColor={active ? theme.accent : undefined}
      paddingX={1}
    >
      <Text color={active ? theme.accent : theme.subtle} bold={active}>
        {label.toUpperCase()}
      </Text>
    </Box>
  );
}

export function ModeTabs({ mode, theme }: { mode: Mode; theme: Theme }) {
  return (
    <Box gap={1}>
      <Tab label="Chat" active={mode === 'chat'} theme={theme} />
      <Tab label="Plan" active={mode === 'plan'} theme={theme} />
      <Tab label="Research" active={mode === 'research'} theme={theme} />
    </Box>
  );
}
