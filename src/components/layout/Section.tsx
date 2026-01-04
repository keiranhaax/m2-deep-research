import React, { type ReactNode } from 'react';
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';

export function Section({
  children,
  theme,
  title,
  marginY = 1,
}: {
  children: ReactNode;
  theme: Theme;
  title?: string;
  marginY?: number;
}) {
  return (
    <Box flexDirection="column" marginY={marginY}>
      {title && (
        <Box marginBottom={1}>
          <Text color={theme.subtle} bold>{title}</Text>
        </Box>
      )}
      {children}
    </Box>
  );
}
