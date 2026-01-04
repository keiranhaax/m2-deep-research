// test/e2e.test.ts
import { describe, it, expect } from 'vitest';
import { detectColorTier, detectUnicodeSupport } from '../src/ui/terminalCaps';
import { createTheme } from '../src/ui/theme';

describe('E2E Integration', () => {
  it('initializes terminal capabilities', () => {
    const tier = detectColorTier();
    expect(['truecolor', 'ansi256', 'basic']).toContain(tier);

    const unicode = detectUnicodeSupport();
    expect(typeof unicode).toBe('boolean');
  });

  it('creates theme from tier', () => {
    const theme = createTheme('truecolor');
    expect(theme.accent).toBe('#E88D35');
    expect(theme.tier).toBe('truecolor');
  });
});
