// src/components/footer/FooterInput.tsx
import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import type { Theme } from '../../ui/theme';
import type { Mode } from '../header/ModeTabs';

interface FooterInputProps {
  theme: Theme;
  onSubmit: (text: string) => void;
  onModeChange: (mode: Mode) => void;
  placeholder?: string;
}

export function FooterInput({
  theme,
  onSubmit,
  onModeChange,
  placeholder = 'Type a message...',
}: FooterInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (text: string) => {
    const trimmed = text.trim();

    if (trimmed.startsWith('/')) {
      const command = trimmed.slice(1).toLowerCase();

      if (command === 'chat') {
        onModeChange('chat');
        setValue('');
        return;
      }

      if (command === 'plan') {
        onModeChange('plan');
        setValue('');
        return;
      }

      if (command === 'research' || command === 'r') {
        onModeChange('research');
        setValue('');
        return;
      }
    }

    if (trimmed) {
      onSubmit(trimmed);
      setValue('');
    }
  };

  return (
    <Box>
      <Text color={theme.accent} bold>{'> '}</Text>
      <TextInput
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        placeholder={placeholder}
      />
    </Box>
  );
}
