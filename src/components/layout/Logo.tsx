
import { Box, Text } from 'ink';
import type { Theme } from '../../ui/theme';

type LogoSize = 'banner' | 'monogram' | 'compact' | 'minimal';

interface LogoProps {
  theme: Theme;
  unicodeOk: boolean;
  reduceMotion: boolean;
  size?: LogoSize;
}

export function Logo({
  theme,
  unicodeOk,
  size = 'monogram',
}: LogoProps) {
  if (!unicodeOk) {
    return <Text color={theme.accent2}>ResearchOS</Text>;
  }

  if (size === 'minimal') {
    return <Text color={theme.accent} bold>R.OS</Text>;
  }

  if (size === 'compact') {
    return (
      <Box>
        <Text color={theme.accent2} bold>◆ </Text>
        <Text color={theme.accent} bold>R</Text>
        <Text color={theme.dim}>.</Text>
        <Text color={theme.accent} bold>OS</Text>
      </Box>
    );
  }

  if (size === 'banner') {
    return (
      <Box flexDirection="column">
        <Text color={theme.accent} bold>█▀█  ░  █▀█  █▀</Text>
        <Text color={theme.accent2} bold>█▀▄  ░  █▄█  ▄█</Text>
      </Box>
    );
  }

  // Default: monogram
  return (
    <Box flexDirection="column">
      <Text color={theme.accent} bold>█▀█</Text>
      <Text color={theme.accent2} bold>█▀▄</Text>
    </Box>
  );
}
