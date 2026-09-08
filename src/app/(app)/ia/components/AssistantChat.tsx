"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { askAssistant, type ChatMessage } from "../actions";

const SUGGESTIONS = [
  "Quais são minhas prioridades hoje?",
  "Quantos clientes ativos eu tenho?",
  "Quais processos estão em andamento?",
  "O que tenho na agenda essa semana?",
];

export default function AssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isPending) return;

    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");

    startTransition(async () => {
      const result = await askAssistant(nextMessages);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", text: result.reply }]);
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] min-h-[420px] max-w-3xl border border-surface-container-high bg-surface-container-lowest rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <div className="flex items-center justify-center h-14 w-14 rounded-full bg-surface-container border border-surface-container-high">
              <span className="material-symbols-outlined text-2xl text-on-surface-variant">auto_awesome</span>
            </div>
            <div className="space-y-1">
              <p className="text-primary font-semibold">Assistente IA</p>
              <p className="font-body-md text-on-surface-variant text-sm max-w-sm">
                Pergunte sobre seus clientes, processos, tarefas e agenda.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => send(suggestion)}
                  className="border border-surface-container-high text-on-surface-variant text-xs px-3 py-2 rounded-full hover:text-primary hover:bg-surface-container transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-wrap ${
                message.role === "user"
                  ? "bg-primary text-background"
                  : "bg-surface-container border border-surface-container-high text-primary"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex justify-start">
            <div className="bg-surface-container border border-surface-container-high text-on-surface-variant rounded-lg px-4 py-2.5 text-sm">
              Pensando...
            </div>
          </div>
        )}

        {error && (
          <div className="border border-surface-container-high bg-surface-container rounded-md px-4 py-3">
            <p className="text-error text-sm">{error}</p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-3 border-t border-surface-container-high p-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo sobre seus clientes, processos ou agenda..."
          className="flex-1 bg-surface-container border border-surface-container-high rounded-md px-4 py-2.5 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="bg-primary text-background font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-secondary transition-colors disabled:opacity-60 shrink-0"
        >
          ENVIAR
        </button>
      </form>
    </div>
  );
}
