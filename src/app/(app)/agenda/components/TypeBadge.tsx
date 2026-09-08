import { TYPE_LABELS, type EventType } from "../types";

const TYPE_DOT: Record<EventType, string> = {
  compromisso: "bg-[#8ab4e8]",
  audiencia: "bg-[#c398e8]",
};

export default function TypeBadge({ type }: { type: EventType }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-container-high text-xs font-label-caps text-on-surface-variant">
      <span className={`w-1.5 h-1.5 rounded-full ${TYPE_DOT[type]}`} />
      {TYPE_LABELS[type]}
    </span>
  );
}
