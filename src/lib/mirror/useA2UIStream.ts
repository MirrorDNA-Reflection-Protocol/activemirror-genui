import { useState, useCallback } from 'react';
import { MirrorSurfaceSpec } from './schema';

export type A2UIEnvelope = 
  | { envelope: "surfaceUpdate"; surface_id: string; component: any }
  | { envelope: "dataModelUpdate"; surface_id: string; data: Record<string, string> }
  | { envelope: "beginRendering"; surface_id: string };

export function useA2UIStream(apiEndpoint: string) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // The raw protocol state
  const [a2uiState, setA2uiState] = useState<{
    surface_id: string | null;
    components: any[];
    dataModel: Record<string, string>;
    renderLock: boolean;
  }>({
    surface_id: null,
    components: [],
    dataModel: {},
    renderLock: false,
  });

  const submit = useCallback(async (payload: { messages: { role: "user" | "assistant"; content: string }[] }) => {
    setIsLoading(true);
    setError(null);
    setMessages(payload.messages);
    
    // Reset state for new run
    setA2uiState({ surface_id: null, components: [], dataModel: {}, renderLock: false });
    
    // We maintain a draft state locally to prevent layout thrashing until beginRendering is called
    let draftState = {
      surface_id: null as string | null,
      components: [] as any[],
      dataModel: {} as Record<string, string>,
      renderLock: false,
    };

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No readable stream returned');
      
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer
        
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const envelope = JSON.parse(line) as A2UIEnvelope;
            
            if (envelope.envelope === 'surfaceUpdate') {
              draftState.surface_id = envelope.surface_id;
              draftState.components.push(envelope.component);
              
              // Optimistic UI update for structural changes
              setA2uiState(prev => ({
                ...prev,
                surface_id: draftState.surface_id,
                components: [...draftState.components]
              }));
            } 
            else if (envelope.envelope === 'dataModelUpdate') {
              if (envelope.data["thought_process.append"]) {
                const currentThoughts = draftState.dataModel["thought_process"] 
                  ? JSON.parse(draftState.dataModel["thought_process"]) 
                  : [];
                currentThoughts.push(envelope.data["thought_process.append"]);
                draftState.dataModel["thought_process"] = JSON.stringify(currentThoughts);
              }
              
              for (const key of Object.keys(envelope.data)) {
                if (key !== "thought_process.append") {
                  draftState.dataModel[key] = envelope.data[key];
                }
              }
              
              // Optimistic UI update for text streaming
              setA2uiState(prev => ({
                ...prev,
                dataModel: { ...draftState.dataModel }
              }));
            }
            else if (envelope.envelope === 'beginRendering') {
              draftState.renderLock = true;
              
              // Final commit of all state batching
              setA2uiState({ ...draftState });
            }
          } catch (e) {
            console.error('Failed to parse envelope:', line, e);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [apiEndpoint]);

  return { submit, messages, a2uiState, isLoading, error };
}
