import { describe, it, expect } from 'vitest';
import { ProtocolEventSchema, ReadyEventSchema } from '../src/protocol/types';

describe('Protocol types', () => {
  it('validates ready event (sent unwrapped)', () => {
    // NOTE: ready event is sent WITHOUT envelope wrapper per DESIGN.md
    const ready = {
      type: 'ready',
      protocolVersion: '1.0',
      capabilities: ['chat', 'plan', 'research']
    };
    expect(ReadyEventSchema.safeParse(ready).success).toBe(true);
  });

  it('validates content_delta event', () => {
    const event = { type: 'content_delta', text: 'Hello' };
    expect(ProtocolEventSchema.safeParse(event).success).toBe(true);
  });

  it('validates complete event', () => {
    const event = { type: 'complete' };
    expect(ProtocolEventSchema.safeParse(event).success).toBe(true);
  });
});
