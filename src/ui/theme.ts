import type { ColorTier } from './terminalCaps';

export interface Theme {
  tier: ColorTier;
  accent: string;
  accent2: string;
  dim: string;
  text: string;
  subtle: string;
  error: string;
  success: string;
  border: string;
  borderFocus: string;
}

export function createTheme(tier: ColorTier): Theme {
  if (tier === 'truecolor') {
    return {
      tier,
      accent: '#E88D35',
      accent2: '#E65A54',
      dim: '#F4C4C0',
      text: '#FFFFFF',
      subtle: '#8A8A8A',
      error: '#E65A54',
      success: '#73C991',
      border: '#E65A54',
      borderFocus: '#E88D35',
    };
  }

  if (tier === 'ansi256') {
    return {
      tier,
      accent: 'yellow',
      accent2: 'red',
      dim: 'magenta',
      text: 'white',
      subtle: 'gray',
      error: 'red',
      success: 'green',
      border: 'red',
      borderFocus: 'yellow',
    };
  }

  return {
    tier,
    accent: 'yellow',
    accent2: 'red',
    dim: 'gray',
    text: 'white',
    subtle: 'gray',
    error: 'red',
    success: 'green',
    border: 'red',
    borderFocus: 'yellow',
  };
}
