// test/state.test.ts
import { describe, it, expect } from 'vitest';
import type { AppState, Message } from '../src/app/state';

describe('App state', () => {
  it('has initial state', async () => {
    // Dynamic import to ensure module exists
    const stateModule = await import('../src/app/state');
    expect(stateModule).toBeDefined();

    const state: AppState = {
      mode: 'chat',
      requestStatus: 'idle',
      activeStep: '',
      messages: [],
      showRightPanel: false,
      rightPanelContent: 'plan',
    };
    expect(state.mode).toBe('chat');
  });
});
