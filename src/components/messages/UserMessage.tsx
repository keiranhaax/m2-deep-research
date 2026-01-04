// src/components/messages/UserMessage.tsx
import React from 'react';
import { Box, Text } from 'ink';
import type { Message } from '../../app/state';
import type { Theme } from '../../ui/theme';

export function UserMessage({ message, theme }: { message: Message; theme: Theme }) {
  return (
    <Box marginY={1}>
      <Text color={theme.accent} bold>{'> '}</Text>
      <Text color={theme.text}>{message.content}</Text>
    </Box>
  );
}
