"use client";
import { useState } from "react";

export default function SuccessBanner({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <div className="flex items-center justify-between gap-3 border border-surface-container-high bg-surface-container-lowest rounded-md px-4 py-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-lg text-[#8fd19e]">check_circle</span>
        <p className="font-body-md text-primary text-sm">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Fechar"
        className="text-on-surface-variant hover:text-primary transition-colors shrink-0"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}
