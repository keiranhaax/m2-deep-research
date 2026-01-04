// src/components/messages/LogMessage.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Message } from '../../app/state';
import type { Theme } from '../../ui/theme';

export function LogMessage({ message, theme }: { message: Message; theme: Theme }) {
  return (
    <Box
      marginY={0}
      borderStyle="single"
      borderColor={theme.dim}
      paddingX={1}
      paddingY={0}
    >
      <Text color={theme.dim}>{message.content}</Text>
    </Box>
  );
}
