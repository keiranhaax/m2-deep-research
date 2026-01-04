// src/protocol/client.ts
import { spawn, ChildProcess } from 'child_process';
import { ProtocolEnvelopeSchema } from './types';

export class PythonClient {
  private process: ChildProcess | null = null;

  async spawn(): Promise<void> {
    this.process = spawn('python', ['-m', 'core'], {
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    this.process.stdout?.on('data', (chunk: Buffer) => {
      const line = chunk.toString().trim();
      if (line) {
        try {
          const parsed = JSON.parse(line);
          const result = ProtocolEnvelopeSchema.safeParse(parsed);
          if (result.success) {
            this.emit('event', result.data);
          }
        } catch {
          console.error('Failed to parse:', line);
        }
      }
    });
  }

  send(command: object): void {
    if (!this.process?.stdin?.writable) {
      throw new Error('Python process not running');
    }
    this.process.stdin.write(JSON.stringify(command) + '\n');
  }

  kill(): void {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  private emit(event: string, data: unknown) {
    // Event emitter implementation would go here
  }
}
