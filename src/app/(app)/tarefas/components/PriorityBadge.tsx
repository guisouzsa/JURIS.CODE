import { PRIORITY_LABELS, type TaskPriority } from "../types";

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: "bg-outline",
  medium: "bg-[#e8c56a]",
  high: "bg-[#e8877a]",
};

export default function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-container-high text-xs font-label-caps text-on-surface-variant">
      <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[priority]}`} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
