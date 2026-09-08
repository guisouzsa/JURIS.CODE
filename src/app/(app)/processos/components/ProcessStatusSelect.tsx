"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setProcessStatus } from "../actions";
import { STATUS_LABELS, type ProcessStatus } from "../types";

export default function ProcessStatusSelect({
  processId,
  status,
}: {
  processId: string;
  status: ProcessStatus;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(status);

  function handleChange(next: ProcessStatus) {
    setValue(next);
    startTransition(async () => {
      await setProcessStatus(processId, next);
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as ProcessStatus)}
      className="bg-surface-container border border-surface-container-high rounded-md px-3 py-2 font-label-caps text-xs text-primary focus:outline-none focus:border-accent-gray transition-colors disabled:opacity-60"
    >
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  );
}
