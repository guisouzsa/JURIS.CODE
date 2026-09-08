"use client";
import { createContext, useCallback, useContext, useRef, useState, useTransition, type ReactNode } from "react";
import { askAssistant, type ChatMessage } from "../../ia/actions";

type AssistantContextValue = {
  messages: ChatMessage[];
  isPending: boolean;
  error: string | null;
  newConversationConfirmOpen: boolean;
  requestNewConversation: () => void;
  confirmNewConversation: () => void;
  cancelNewConversation: () => void;
  send: (text: string, pageContext?: string) => void;
  retry: () => void;
};

const AssistantContext = createContext<AssistantContextValue | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newConversationConfirmOpen, setNewConversationConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const lastAttemptRef = useRef<{ messages: ChatMessage[]; pageContext?: string } | null>(null);

  const requestNewConversation = useCallback(() => {
    if (messages.length === 0) return;
    setNewConversationConfirmOpen(true);
  }, [messages.length]);

  const confirmNewConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    lastAttemptRef.current = null;
    setNewConversationConfirmOpen(false);
  }, []);

  const cancelNewConversation = useCallback(() => setNewConversationConfirmOpen(false), []);

  const runAttempt = useCallback((nextMessages: ChatMessage[], pageContext?: string) => {
    lastAttemptRef.current = { messages: nextMessages, pageContext };
    setError(null);
    startTransition(async () => {
      const result = await askAssistant(nextMessages, pageContext);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", text: result.reply }]);
    });
  }, []);

  const send = useCallback(
    (text: string, pageContext?: string) => {
      const trimmed = text.trim();
      if (!trimmed || isPending) return;
      const nextMessages: ChatMessage[] = [...messages, { role: "user", text: trimmed }];
      setMessages(nextMessages);
      runAttempt(nextMessages, pageContext);
    },
    [isPending, messages, runAttempt]
  );

  const retry = useCallback(() => {
    if (isPending || !lastAttemptRef.current) return;
    runAttempt(lastAttemptRef.current.messages, lastAttemptRef.current.pageContext);
  }, [isPending, runAttempt]);

  return (
    <AssistantContext.Provider
      value={{
        messages,
        isPending,
        error,
        newConversationConfirmOpen,
        requestNewConversation,
        confirmNewConversation,
        cancelNewConversation,
        send,
        retry,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error("useAssistant deve ser usado dentro de AssistantProvider.");
  return ctx;
}
