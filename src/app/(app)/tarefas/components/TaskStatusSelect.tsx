"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setTaskStatus } from "../actions";
import { STATUS_LABELS, type TaskStatus } from "../types";

export default function TaskStatusSelect({ taskId, status }: { taskId: string; status: TaskStatus }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(status);

  function handleChange(next: TaskStatus) {
    setValue(next);
    startTransition(async () => {
      await setTaskStatus(taskId, next);
      router.refresh();
    });
  }

  return (
    <select
      value={value}
      disabled={isPending}
      onChange={(e) => handleChange(e.target.value as TaskStatus)}
      className="bg-surface-container border border-surface-container-high rounded-md px-3 py-2 font-label-caps text-xs text-primary focus:outline-none focus:border-accent-gray transition-colors disabled:opacity-60"
    >
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  );
}
