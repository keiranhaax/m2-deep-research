import React, { type ReactNode } from 'react';
import { Box } from 'ink';
import type { Theme } from '../../ui/theme';

const FRAME_WIDTH = 76;
const FRAME_MIN_HEIGHT = 32;

interface FrameProps {
  children: ReactNode;
  theme: Theme;
  borderColor?: string;
  showFooter?: boolean;
}

export function Frame({
  children,
  theme,
  borderColor,
  showFooter = true,
}: FrameProps) {
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={borderColor ?? theme.border}
      paddingX={2}
      paddingY={1}
      width={FRAME_WIDTH}
      minHeight={FRAME_MIN_HEIGHT}
    >
      {children}
      {showFooter && <Box marginTop={1} />}
    </Box>
  );
}
