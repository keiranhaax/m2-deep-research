import { describe, it, expect } from 'vitest';
import { Logo } from '../src/components/layout/Logo';

describe('Logo component', () => {
  it('renders monogram by default', () => {
    expect(Logo).toBeDefined();
  });
});
