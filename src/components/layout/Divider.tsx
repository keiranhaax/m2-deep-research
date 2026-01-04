
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';
import { getIcons } from '../../ui/constants';

interface DividerProps {
  theme: Theme;
  unicodeOk?: boolean;
  width?: number;
  color?: string;
}

export function Divider({
  theme,
  unicodeOk = true,
  width = 60,
  color,
}: DividerProps) {
  const icons = getIcons(unicodeOk);
  return (
    <Box marginY={1}>
      <Text color={color ?? theme.border}>
        {icons.horizontalLine.repeat(width)}
      </Text>
    </Box>
  );
}
