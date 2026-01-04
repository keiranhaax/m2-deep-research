// src/index.tsx
import React from 'react';
import { render } from 'ink';
import { App } from './app/App';

export { App };

const instance = render(<App />);

process.on('SIGINT', () => {
  instance.unmount();
  process.exit(0);
});
