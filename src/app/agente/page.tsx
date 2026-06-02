'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';

interface DbMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
}

function toUIMessage(m: DbMessage): UIMessage {
  return {
    id: m.id,
    role: m.role === 'USER' ? 'user' : 'assistant',
    parts: [{ type: 'text', text: m.content }],
  };
}

function textOf(m: UIMessage): string {
  return (m.parts ?? [])
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

const WELCOME =
  'Hola, soy tu Acompañante. Estoy aquí para escucharte sin juzgar. ¿Cómo te sientes hoy?';

export default function AgentePage() {
  const [input, setInput] = useState('');
  const [initializing, setInitializing] = useState(true);
  const convIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/agente/chat' }),
  });

  // Inicializa: carga la conversación más reciente o crea una nueva.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const listRes = await fetch('/api/agente/conversations');
        const list = listRes.ok ? await listRes.json() : [];
        let id: string | null = Array.isArray(list) && list.length > 0 ? list[0].id : null;

        if (id) {
          const detailRes = await fetch(`/api/agente/conversations/${id}`);
          if (detailRes.ok) {
            const detail = await detailRes.json();
            if (!cancelled && Array.isArray(detail.messages)) {
              setMessages(detail.messages.map(toUIMessage));
            }
          }
        } else {
          const createRes = await fetch('/api/agente/conversations', { method: 'POST' });
          if (createRes.ok) id = (await createRes.json()).id;
        }

        if (!cancelled) {
          convIdRef.current = id;
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setMessages]);

  // Auto-scroll al último mensaje.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, status]);

  const busy = status === 'submitted' || status === 'streaming';

  const handleSend = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || busy || !convIdRef.current) return;
      setInput('');
      sendMessage({ text }, { body: { conversationId: convIdRef.current } });
    },
    [input, busy, sendMessage],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] md:h-screen px-4 py-4">
      <header className="flex-shrink-0">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Agente</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Acompañamiento emocional</p>
      </header>

      {/* Disclaimer */}
      <div className="flex-shrink-0 mt-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
        No reemplaza atención profesional. En crisis llama a la <strong>Línea 106</strong> o
        emergencias <strong>123</strong>.
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-4 space-y-3"
      >
        {messages.length === 0 && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200">
              {initializing ? 'Cargando…' : WELCOME}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={[
                  'max-w-[80%] px-4 py-2.5 text-sm whitespace-pre-wrap',
                  isUser
                    ? 'bg-violet-500 text-white rounded-2xl rounded-br-sm'
                    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl rounded-bl-sm',
                ].join(' ')}
              >
                {textOf(m) || (busy ? '…' : '')}
              </div>
            </div>
          );
        })}

        {error && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 px-4 py-2.5 text-sm text-red-700 dark:text-red-300">
              Hubo un problema al responder. Intenta de nuevo.
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex-shrink-0 flex items-end gap-2 pt-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSend(e);
            }
          }}
          rows={1}
          placeholder="Escribe cómo te sientes…"
          disabled={initializing}
          className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={busy || initializing || !input.trim()}
          className="flex-shrink-0 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-40 transition-colors"
        >
          {busy ? '…' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
