"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setClientStatus } from "../actions";
import type { ClientStatus } from "../types";

export default function ClientStatusAction({ clientId, status }: { clientId: string; status: ClientStatus }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const isInactive = status === "inactive";
  const nextStatus: ClientStatus = isInactive ? "active" : "inactive";

  async function handleConfirm() {
    setPending(true);
    try {
      await setClientStatus(clientId, nextStatus);
      router.refresh();
      setOpen(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-surface-container-high text-primary font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-surface-container transition-colors"
      >
        {isInactive ? "REATIVAR" : "INATIVAR"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm border border-surface-container-high bg-surface-container-lowest rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-2">
              {isInactive ? "Reativar cliente?" : "Inativar cliente?"}
            </h3>
            <p className="font-body-md text-on-surface-variant text-sm mb-6">
              {isInactive
                ? "O cliente voltará a aparecer nas listagens padrão."
                : "O cliente sairá das listagens padrão. Processos, tarefas e documentos vinculados continuam existindo e visíveis."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="font-body-md text-on-surface-variant hover:text-primary transition-colors text-sm px-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending}
                className="bg-primary text-background font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-secondary transition-colors disabled:opacity-60"
              >
                {pending ? "..." : isInactive ? "REATIVAR" : "INATIVAR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
