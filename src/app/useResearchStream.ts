// src/app/useResearchStream.ts
import { useCallback } from 'react';
import type { UiEvent, AppState, AppActions } from './state';

export function useResearchStream({
  actions,
}: {
  state: AppState;
  actions: AppActions;
  eventSource: AsyncIterable<UiEvent> | null;
}) {
  const handleEvent = useCallback((event: UiEvent) => {
    switch (event.type) {
      case 'content_delta':
        actions.setActiveStep('Generating response...');
        break;
      case 'complete':
        actions.setRequestStatus('idle');
        actions.setActiveStep('Complete');
        break;
      case 'aborted':
        actions.setRequestStatus('aborted');
        actions.setActiveStep('Aborted');
        break;
      case 'error':
        actions.setRequestStatus('error');
        actions.setActiveStep(`Error: ${event.message}`);
        break;
    }
  }, [actions]);

  return { handleEvent };
}
