// src/components/messages/AnswerMessage.tsx

import { Box, Text } from 'ink';
import type { Message } from '../../app/state';
import type { Theme } from '../../ui/theme';

export function AnswerMessage({ message, theme }: { message: Message; theme: Theme }) {
  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text color={theme.text}>{message.content}</Text>
      </Box>
    </Box>
  );
}
