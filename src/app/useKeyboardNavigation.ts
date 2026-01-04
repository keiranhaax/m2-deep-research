// src/app/useKeyboardNavigation.ts
import { useInput } from 'ink';
import type { Mode } from '../components/header/ModeTabs';

export function useKeyboardNavigation({
  mode,
  onModeChange,
  onAbort,
}: {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  onAbort?: () => void;
}) {
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      onAbort?.();
      return;
    }

    if (key.escape) {
      const modes: Mode[] = ['chat', 'plan', 'research'];
      const currentIndex = modes.indexOf(mode);
      const nextIndex = (currentIndex + 1) % modes.length;
      const nextMode = modes[nextIndex];
      if (nextMode) {
        onModeChange(nextMode);
      }
      return;
    }
  });
}
