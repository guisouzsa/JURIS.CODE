import { STATUS_LABELS, type TaskStatus } from "../types";

const STATUS_DOT: Record<TaskStatus, string> = {
  pending: "bg-outline",
  in_progress: "bg-[#8ab4e8]",
  done: "bg-[#8fd19e]",
  canceled: "bg-[#a1a1aa]",
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-container-high text-xs font-label-caps text-on-surface-variant">
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
