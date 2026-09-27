import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import useChatStore from '../../store/chatStore';
import { useAuth } from '../../context/AuthContext';
import { IS_N8N_MOCK } from '../../services/n8n';
import QuoteCard from './QuoteCard';
import AppointmentCard, { AppointmentConfirmed } from './AppointmentCard';

const TypingIndicator = () => (
  <div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3" role="status" aria-label="Escribiendo">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

const MessageBubble = ({ message, sessionId, onSuggestion, onRetry, onScheduled, isLast }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
      {message.text && (
        // Texto plano: la respuesta de la IA nunca se inyecta como HTML
        <p
          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-line ${
            isUser ? 'rounded-br-md bg-ink text-white' : 'rounded-bl-md bg-surface text-ink'
          } ${message.error ? 'border border-accent/40' : ''}`}
        >
          {message.text}
        </p>
      )}

      {message.error && (
        <button type="button" onClick={() => onRetry(message.id)} className="text-sm font-semibold underline underline-offset-4">
          Reintentar
        </button>
      )}

      {message.quote && (
        <div className="w-full max-w-[92%]">
          <QuoteCard quote={message.quote} compact />
        </div>
      )}

      {message.appointment && (
        <div className="w-full max-w-[92%]">
          {message.scheduled ? (
            <AppointmentConfirmed result={message.scheduled} />
          ) : (
            <AppointmentCard
              compact
              appointment={message.appointment}
              sessionId={sessionId}
              quoteId={message.quote?.quoteId}
              onScheduled={(result) => onScheduled(message.id, result)}
            />
          )}
        </div>
      )}

      {/* Sugerencias rápidas solo en la última respuesta */}
      {isLast && message.suggestions?.length > 0 && (
        <div className="flex max-w-full flex-wrap gap-2">
          {message.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestion(s)}
              className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm transition-colors hover:border-ink/40"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Chat web conectado a n8n. Sistema aislado del WhatsApp personal:
 * el frontend solo envía mensajes y renderiza lo que responde el flujo de IA.
 */
const ChatWidget = () => {
  const { pathname } = useLocation();
  const { currentUser, userProfile } = useAuth();
  const { sessionId, messages, isOpen, isSending, open, close, send, retry, updateMessage, reset } = useChatStore();
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const reduceMotion = useReducedMotion();

  const ctx = {
    page: pathname,
    user: currentUser
      ? { uid: currentUser.uid, email: currentUser.email, name: userProfile?.displayName ?? currentUser.displayName }
      : null,
  };

  // Mantener visible el último mensaje
  useEffect(() => {
    if (isOpen) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  // El panel administrativo no muestra el chat de clientes
  if (pathname.startsWith('/admin')) return null;

  const submit = (text) => {
    if (!text.trim()) return;
    send(text, ctx);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(draft);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            onClick={open}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed right-4 bottom-4 z-50 flex h-12 items-center gap-2.5 rounded-full bg-ink pr-5 pl-4 text-sm font-semibold text-white shadow-[0_12px_32px_-12px_rgb(0_0_0/0.5)] transition-transform hover:-translate-y-0.5 sm:right-6 sm:bottom-6"
          >
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            Cotiza por chat
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.section
            role="dialog"
            aria-label="Chat con IMPRIME con SHIR"
            initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[min(640px,88dvh)] flex-col overflow-hidden rounded-t-3xl border border-line bg-paper shadow-[0_24px_64px_-16px_rgb(0_0_0/0.35)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[400px] sm:rounded-3xl"
          >
            <header className="flex items-center justify-between gap-4 border-b border-line bg-surface px-5 py-4">
              <div>
                <p className="font-display font-bold">Equipo SHIR</p>
                <p className="text-xs text-muted">
                  {IS_N8N_MOCK ? 'Modo de prueba · respuestas simuladas' : 'Respuesta inmediata'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={reset} className="rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:bg-ink/5 hover:text-ink">
                  Nueva
                </button>
                <button type="button" onClick={close} className="rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-ink/5">
                  Cerrar
                </button>
              </div>
            </header>

            <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
              {messages.map((m, i) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  sessionId={sessionId}
                  isLast={i === messages.length - 1 && !isSending}
                  onSuggestion={submit}
                  onRetry={(id) => retry(id, ctx)}
                  onScheduled={(id, result) => updateMessage(id, { scheduled: result })}
                />
              ))}
              {isSending && <TypingIndicator />}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(draft);
              }}
              className="flex items-end gap-2 border-t border-line bg-surface p-3"
            >
              <label htmlFor="chat-input" className="sr-only">
                Escribe tu mensaje
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                value={draft}
                maxLength={1000}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe qué necesitas…"
                className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-line bg-paper px-4 py-2.5 text-[15px] focus:border-ink focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                className="h-11 shrink-0 rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
              >
                Enviar
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
