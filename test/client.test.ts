// test/client.test.ts
import { PythonClient } from '../src/protocol/client';

describe('Python client', () => {
  it('creates client', () => {
    const client = new PythonClient();
    expect(client).toBeDefined();
  });
});
