import { STATUS_LABELS, type ClientStatus } from "../types";

const STATUS_DOT: Record<ClientStatus, string> = {
  active: "bg-[#8fd19e]",
  inactive: "bg-outline",
  prospect: "bg-[#e8c56a]",
  former: "bg-[#a1a1aa]",
};

export default function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-surface-container-high text-xs font-label-caps text-on-surface-variant">
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
