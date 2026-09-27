import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { n8nErrorMessage, sendChatMessage } from '../services/n8n';

const HISTORY_LIMIT = 10; // mensajes previos que se envían como contexto

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  text: '¡Hola! Cuéntame qué quieres imprimir y te cotizo en minutos.',
  suggestions: ['Cotizar una lona', 'Rotular mi camioneta', 'Material para un evento'],
};

// sessionStorage puede no estar disponible (modo privado estricto, iframes)
const safeSessionStorage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
};

/**
 * Estado del chat web. Independiente del WhatsApp personal de la dueña:
 * cada conversación se identifica con un `sessionId` propio que n8n usa como memoria.
 */
const useChatStore = create(
  persist(
    (set, get) => ({
      sessionId: uuidv4(),
      messages: [WELCOME],
      isOpen: false,
      isSending: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      /** Marca una tarjeta (cita/cotización) como resuelta para no mostrar el formulario de nuevo */
      updateMessage: (id, patch) =>
        set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),

      send: async (text, { user, page } = {}) => {
        const message = text.trim();
        if (!message || get().isSending) return;

        const userMsg = { id: uuidv4(), role: 'user', text: message };
        const history = get()
          .messages.filter((m) => m.id !== 'welcome' && !m.error)
          .slice(-HISTORY_LIMIT)
          .map(({ role, text: t }) => ({ role, text: t }));

        set((s) => ({ messages: [...s.messages, userMsg], isSending: true }));

        try {
          const res = await sendChatMessage({ sessionId: get().sessionId, message, history, user, page });
          set((s) => ({
            messages: [
              ...s.messages,
              {
                id: uuidv4(),
                role: 'assistant',
                text: String(res?.reply ?? ''),
                intent: res?.intent ?? 'general',
                quote: res?.quote ?? null,
                appointment: res?.appointment ?? null,
                suggestions: Array.isArray(res?.suggestions) ? res.suggestions.slice(0, 4) : [],
              },
            ],
          }));
        } catch (error) {
          set((s) => ({
            messages: [
              ...s.messages,
              { id: uuidv4(), role: 'assistant', text: n8nErrorMessage(error), error: true, retryText: message },
            ],
          }));
        } finally {
          set({ isSending: false });
        }
      },

      /** Reintenta un mensaje fallido quitando el error y el mensaje original */
      retry: (errorId, ctx) => {
        const errorMsg = get().messages.find((m) => m.id === errorId);
        if (!errorMsg?.retryText) return;
        set((s) => {
          const idx = s.messages.findIndex((m) => m.id === errorId);
          return { messages: s.messages.filter((_, i) => i !== idx && i !== idx - 1) };
        });
        get().send(errorMsg.retryText, ctx);
      },

      reset: () => set({ sessionId: uuidv4(), messages: [WELCOME], isSending: false }),
    }),
    {
      name: 'chat-session',
      storage: createJSONStorage(safeSessionStorage),
      partialize: ({ sessionId, messages }) => ({ sessionId, messages }),
    }
  )
);

export default useChatStore;
