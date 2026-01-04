export interface Icons {
  pointer: string;
  pointerEmpty: string;
  arrowRight: string;
  arrowLeft: string;
  arrowUp: string;
  arrowDown: string;
  check: string;
  cross: string;
  warning: string;
  bullet: string;
  star: string;
  diamond: string;
  circle: string;
  square: string;
  horizontalLine: string;
  horizontalLineThick: string;
}

const unicodeIcons: Icons = {
  pointer: '▸',
  pointerEmpty: ' ',
  arrowRight: '→',
  arrowLeft: '←',
  arrowUp: '↑',
  arrowDown: '↓',
  check: '✓',
  cross: '✗',
  warning: '!',
  bullet: '•',
  star: '★',
  diamond: '◆',
  circle: '●',
  square: '■',
  horizontalLine: '─',
  horizontalLineThick: '━',
};

const asciiIcons: Icons = {
  pointer: '>',
  pointerEmpty: ' ',
  arrowRight: '->',
  arrowLeft: '<-',
  arrowUp: '^',
  arrowDown: 'v',
  check: '+',
  cross: 'x',
  warning: '!',
  bullet: '*',
  star: '*',
  diamond: '*',
  circle: 'o',
  square: '#',
  horizontalLine: '-',
  horizontalLineThick: '=',
};

export function getIcons(unicodeOk: boolean): Icons {
  return unicodeOk ? unicodeIcons : asciiIcons;
}

export const icons = unicodeIcons;

export const keyHints = {
  navigate: '↑↓ Navigate',
  select: '↵ Select',
  back: 'Esc Back',
  mode: 'Esc /mode',
  abort: 'Ctrl+C Abort',
} as const;
