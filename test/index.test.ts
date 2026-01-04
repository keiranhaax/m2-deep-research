// test/index.test.ts
import { describe, it, expect } from 'vitest';

describe('Entry point', () => {
  it('exports App', async () => {
    const indexModule = await import('../src/index');
    expect(indexModule.App).toBeDefined();
  });
});
