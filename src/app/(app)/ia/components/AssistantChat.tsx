"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAssistant } from "../../components/assistant/AssistantContext";
import MarkdownMessage from "./MarkdownMessage";

const SUGGESTIONS = [
  "Quais são minhas prioridades hoje?",
  "O que eu tenho cadastrado?",
  "Quais processos estão em andamento?",
  "O que tenho na agenda essa semana?",
];

const MODULE_LABELS: { prefix: string; label: string }[] = [
  { prefix: "/dashboard", label: "Dashboard" },
  { prefix: "/clientes", label: "Clientes" },
  { prefix: "/processos", label: "Processos" },
  { prefix: "/tarefas", label: "Tarefas" },
  { prefix: "/agenda", label: "Agenda" },
];

function pageContextLabel(pathname: string): string | undefined {
  return MODULE_LABELS.find((m) => pathname === m.prefix || pathname.startsWith(`${m.prefix}/`))?.label;
}

export default function AssistantChat() {
  const {
    messages,
    isPending,
    error,
    newConversationConfirmOpen,
    confirmNewConversation,
    cancelNewConversation,
    send,
    retry,
  } = useAssistant();
  const pathname = usePathname();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const context = pageContextLabel(pathname);

  function handleSend(text: string) {
    send(text, context);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full border border-surface-container-high bg-surface-container-lowest rounded-xl overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-w-0">
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
                  onClick={() => handleSend(suggestion)}
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
              className={`max-w-[90%] sm:max-w-[75%] lg:max-w-[720px] min-w-0 rounded-lg px-4 py-2.5 text-sm break-words ${
                message.role === "user"
                  ? "bg-primary text-background whitespace-pre-wrap"
                  : "bg-surface-container border border-surface-container-high text-primary"
              }`}
            >
              {message.role === "user" ? message.text : <MarkdownMessage text={message.text} />}
            </div>
          </div>
        ))}

        {isPending && (
          <div className="flex justify-start">
            <div className="bg-surface-container border border-surface-container-high text-on-surface-variant rounded-lg px-4 py-3 text-sm max-w-[80%]">
              <p className="text-primary font-medium mb-0.5">Analisando sua solicitação...</p>
              <p className="text-xs text-outline">Aguarde alguns segundos — a resposta pode demorar um pouco.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="border border-surface-container-high bg-surface-container rounded-lg px-4 py-3 max-w-[85%] sm:max-w-[80%]">
              <p className="text-error text-sm mb-2">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="border border-surface-container-high text-primary font-label-caps text-xs px-4 py-2 rounded-sm hover:bg-surface-container-high transition-colors"
              >
                TENTAR NOVAMENTE
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
          setInput("");
        }}
        className="flex items-center gap-2 sm:gap-3 border-t border-surface-container-high p-3 sm:p-4 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte sobre clientes, processos, tarefas ou agenda..."
          className="flex-1 min-w-0 bg-surface-container border border-surface-container-high rounded-md px-4 py-2.5 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="bg-primary text-background font-label-caps text-xs px-4 sm:px-5 py-2.5 rounded-sm hover:bg-secondary transition-colors disabled:opacity-60 shrink-0"
        >
          ENVIAR
        </button>
      </form>

      <div className="px-4 pb-3 sm:pb-4 -mt-1 shrink-0 text-center">
        <p className="font-body-md text-outline text-[11px] leading-snug">
          Conversa temporária — não é armazenada. A IA pode cometer erros; verifique antes de decidir.
        </p>
        <p className="font-body-md text-outline/70 text-[11px] leading-snug">
          Continua disponível enquanto você navega pelo sistema; some ao sair ou recarregar a página.
        </p>
      </div>

      {newConversationConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm border border-surface-container-high bg-surface-container-lowest rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-2">Iniciar nova conversa?</h3>
            <p className="font-body-md text-on-surface-variant text-sm mb-6">
              As mensagens desta conversa serão apagadas e não poderão ser recuperadas.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelNewConversation}
                className="font-body-md text-on-surface-variant hover:text-primary transition-colors text-sm px-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmNewConversation}
                className="bg-primary text-background font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-secondary transition-colors"
              >
                Iniciar nova conversa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
