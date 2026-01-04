// src/app/App.tsx
import React, { useCallback, useMemo, useState } from 'react';
import { Box } from 'ink';
import { detectColorTier, detectUnicodeSupport } from '../ui/terminalCaps';
import { createTheme } from '../ui/theme';
import { Frame } from '../components/layout/Frame';
import { Header } from '../components/header/Header';
import { MessageList } from '../components/messages/MessageList';
import { ActiveStep } from '../components/footer/ActiveStep';
import { FooterInput } from '../components/footer/FooterInput';
import { useResearchStream } from './useResearchStream';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import type { Message } from './state';

export function App() {
  const tier = detectColorTier();
  const unicodeOk = detectUnicodeSupport();
  const theme = useMemo(() => createTheme(tier), [tier]);

  const [mode, setMode] = useState<'chat' | 'plan' | 'research'>('chat');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'streaming' | 'aborted' | 'error'>('idle');
  const [activeStep, setActiveStep] = useState('Idle');
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  useResearchStream({
    state: { mode, requestStatus, activeStep, messages, showRightPanel: false, rightPanelContent: 'plan' },
    actions: { setMode, setRequestStatus, setActiveStep, addMessage, updateMessage, clearMessages },
    eventSource: null,
  });

  useKeyboardNavigation({
    mode,
    onModeChange: setMode,
    onAbort: () => setRequestStatus('aborted'),
  });

  const handleSubmit = useCallback((text: string) => {
    addMessage({
      id: crypto.randomUUID(),
      kind: 'user',
      content: text,
      timestamp: Date.now(),
    });
  }, [addMessage]);

  return (
    <Frame theme={theme} showFooter={false}>
      <Header
        theme={theme}
        mode={mode}
        requestStatus={requestStatus}
        unicodeOk={unicodeOk}
      />

      <Box flexGrow={1} flexDirection="column" paddingY={1}>
        <MessageList messages={messages} theme={theme} />
      </Box>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor={theme.subtle}
        paddingX={1}
        paddingY={0}
      >
        <ActiveStep theme={theme} text={activeStep} />
        <FooterInput
          theme={theme}
          onSubmit={handleSubmit}
          onModeChange={setMode}
        />
      </Box>
    </Frame>
  );
}
