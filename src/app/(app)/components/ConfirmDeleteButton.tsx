"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteResult = { error?: string } | void;

export default function ConfirmDeleteButton({
  onConfirm,
  itemLabel,
  variant = "icon",
  redirectTo,
}: {
  onConfirm: () => Promise<DeleteResult>;
  itemLabel: string;
  variant?: "icon" | "button";
  redirectTo?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setPending(true);
    setError(null);
    try {
      const result = await onConfirm();
      if (result && "error" in result && result.error) {
        setError(result.error);
        setPending(false);
        return;
      }
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch {
      setError("Não foi possível excluir agora. Tente novamente.");
      setPending(false);
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Excluir"
          className="text-on-surface-variant hover:text-error transition-colors"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border border-surface-container-high text-error font-label-caps text-xs px-5 py-2.5 rounded-sm hover:bg-surface-container transition-colors"
        >
          EXCLUIR
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm border border-surface-container-high bg-surface-container-lowest rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-2">Excluir {itemLabel}?</h3>
            <p className="font-body-md text-on-surface-variant text-sm mb-4">
              Essa ação não pode ser desfeita.
            </p>
            {error && <p className="text-error text-sm mb-4">{error}</p>}
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
                className="bg-error text-on-error font-label-caps text-xs px-5 py-2.5 rounded-sm hover:opacity-90 transition-colors disabled:opacity-60"
              >
                {pending ? "EXCLUINDO..." : "EXCLUIR"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
