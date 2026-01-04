// src/components/header/Header.tsx

import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';
import { Logo } from '../layout/Logo';
import { ModeTabs } from './ModeTabs';
import { StatusPill } from './StatusPill';

export function Header({
  theme,
  mode,
  requestStatus,
  unicodeOk,
}: {
  theme: Theme;
  mode: 'chat' | 'plan' | 'research';
  requestStatus: 'idle' | 'streaming' | 'aborted' | 'error';
  unicodeOk: boolean;
}) {
  return (
    <Box flexDirection="column" paddingBottom={1}>
      <Box justifyContent="space-between">
        <Box gap={2}>
          <Logo
            theme={theme}
            unicodeOk={unicodeOk}
            reduceMotion={false}
            size="monogram"
          />
          <Box flexDirection="column">
            <Text bold color={theme.text}>ResearchOS</Text>
            <Text color={theme.subtle}>v0.1</Text>
          </Box>
        </Box>
        <StatusPill status={requestStatus} theme={theme} />
      </Box>

      <Box marginTop={1} justifyContent="space-between">
        <ModeTabs mode={mode} theme={theme} />
        <Text color={theme.subtle}>Esc /mode | ↑↓ navigate</Text>
      </Box>
    </Box>
  );
}
