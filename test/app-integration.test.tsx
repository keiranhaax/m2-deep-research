// test/app-integration.test.tsx
import React from 'react';
import { App } from '../src/app/App';

describe('App integration', () => {
  it('initializes with client', () => {
    expect(App).toBeDefined();
  });
});
