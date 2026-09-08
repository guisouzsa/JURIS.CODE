import { STATUS_LABELS, type ProcessStatus } from "../types";

const STATUS_DOT: Record<ProcessStatus, string> = {
  active: "bg-[#8fd19e]",
  suspended: "bg-[#e8c56a]",
  archived: "bg-outline",
  won: "bg-[#8fd19e]",
  lost: "bg-[#e8877a]",
  appeal: "bg-[#8ab4e8]",
};

export default function StatusBadge({ status }: { status: ProcessStatus }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-container-high text-xs font-label-caps text-on-surface-variant">
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
