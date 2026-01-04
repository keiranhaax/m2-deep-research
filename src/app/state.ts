// src/app/state.ts
import type { Mode } from '../components/header/ModeTabs';
import type { RequestStatus } from '../components/header/StatusPill';

export type UiEvent =
  | { type: 'content_delta'; text: string }
  | { type: 'phase_status'; phase: 'planning' | 'researching' | 'synthesizing'; status: 'idle' | 'working' | 'complete' | 'error' }
  | { type: 'progress'; percent: number; message?: string }
  | { type: 'tool_call'; tool: string; query: string }
  | { type: 'tool_result'; tool: string; success: boolean; summary: string; artifactId?: string; error?: string }
  | { type: 'complete' }
  | { type: 'aborted'; partialSaved: boolean }
  | { type: 'error'; message: string; recoverable: false };

export interface AppState {
  mode: Mode;
  requestStatus: RequestStatus;
  activeStep: string;
  messages: Message[];
  showRightPanel: boolean;
  rightPanelContent: 'plan' | 'progress' | 'tool-results';
}

export interface Message {
  id: string;
  kind: 'user' | 'answer' | 'log' | 'tool';
  content: string;
  timestamp: number;
  metadata?: {
    phase?: string;
    tool?: string;
    citations?: string[];
  };
}

export interface AppActions {
  setMode: (mode: Mode) => void;
  setRequestStatus: (status: RequestStatus) => void;
  setActiveStep: (step: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
}
