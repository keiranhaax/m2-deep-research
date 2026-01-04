export type ColorTier = 'truecolor' | 'ansi256' | 'basic';

export function detectColorTier(): ColorTier {
  const hasColor = process.stdout.isTTY;
  if (!hasColor) return 'basic';

  const colorterm = process.env['COLORTERM'] || '';
  if (colorterm === 'truecolor' || colorterm === '24bit') return 'truecolor';

  const term = process.env['TERM'] || '';
  if (term.includes('256')) return 'ansi256';
  if (term.includes('xterm-16color')) return 'basic';

  // Modern terminals typically support truecolor
  if (term.includes('xterm') || term.includes('screen') || term.includes('tmux')) {
    return 'truecolor';
  }

  return 'truecolor';
}

export function detectUnicodeSupport(): boolean {
  const term = process.env['TERM'] || '';
  if (term === 'dumb') return false;

  const lang = process.env['LANG'] || '';
  if (lang.toLowerCase().includes('utf')) return true;

  return true;
}
