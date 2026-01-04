import { describe, it, expect } from 'vitest';
import { createTheme } from '../src/ui/theme';

describe('Theme system', () => {
  it('creates truecolor theme with hex values', () => {
    const theme = createTheme('truecolor');
    expect(theme.accent).toBe('#E88D35');
    expect(theme.accent2).toBe('#E65A54');
  });

  it('creates basic theme with named colors', () => {
    const theme = createTheme('basic');
    expect(theme.accent).toBe('yellow');
    expect(theme.accent2).toBe('red');
  });
});
