// src/components/footer/ActiveStep.tsx
import React from 'react';
import { Text } from 'ink';
import type { Theme } from '../../ui/theme';

export function ActiveStep({ theme, text }: { theme: Theme; text: string }) {
  return (
    <Text color={theme.dim}>
      Active: {text}
    </Text>
  );
}
