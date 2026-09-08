"use client";
import { useAssistant } from "../../components/assistant/AssistantContext";

export default function NewConversationButton() {
  const { messages, requestNewConversation } = useAssistant();

  if (messages.length === 0) return null;

  return (
    <button
      type="button"
      onClick={requestNewConversation}
      className="inline-flex items-center gap-1.5 bg-primary text-background font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-secondary transition-colors shrink-0"
    >
      <span className="material-symbols-outlined text-base">add_comment</span>
      NOVA CONVERSA
    </button>
  );
}
