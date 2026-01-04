// src/components/messages/MessageList.tsx
import React from 'react';
import { Box } from 'ink';
import type { Theme } from '../../ui/theme';
import type { Message } from '../../app/state';
import { UserMessage } from './UserMessage';
import { AnswerMessage } from './AnswerMessage';
import { LogMessage } from './LogMessage';

export function MessageList({ messages, theme }: { messages: Message[]; theme: Theme }) {
  return (
    <Box flexDirection="column" flexGrow={1} overflow="hidden">
      {messages.map((message) => {
        switch (message.kind) {
          case 'user':
            return <UserMessage key={message.id} message={message} theme={theme} />;
          case 'answer':
            return <AnswerMessage key={message.id} message={message} theme={theme} />;
          case 'log':
          case 'tool':
            return <LogMessage key={message.id} message={message} theme={theme} />;
          default:
            return null;
        }
      })}
    </Box>
  );
}
