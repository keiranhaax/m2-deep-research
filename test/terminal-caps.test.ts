import { describe, it, expect } from 'vitest';
import { detectColorTier, detectUnicodeSupport } from '../src/ui/terminalCaps';

describe('Terminal capabilities', () => {
  it('detects color tier', () => {
    const tier = detectColorTier();
    expect(['truecolor', 'ansi256', 'basic']).toContain(tier);
  });

  it('detects unicode support', () => {
    const unicode = detectUnicodeSupport();
    expect(typeof unicode).toBe('boolean');
  });
});
