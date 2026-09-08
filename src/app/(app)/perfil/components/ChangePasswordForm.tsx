"use client";
import { useActionState, useEffect, useRef } from "react";
import { changePassword, type PasswordFormState } from "../actions";

const inputClass =
  "w-full bg-surface-container border border-surface-container-high rounded-md px-4 py-2.5 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors text-sm";

export default function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState<PasswordFormState, FormData>(changePassword, {});
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 max-w-sm">
      {state.error && <p className="text-error text-sm">{state.error}</p>}
      {state.success && <p className="text-sm text-[#8fd19e]">{state.success}</p>}

      <div>
        <label htmlFor="current_password" className="font-label-caps text-label-caps text-on-surface-variant block mb-1.5">
          Senha atual<span className="text-error ml-0.5">*</span>
        </label>
        <input id="current_password" name="current_password" type="password" className={inputClass} />
        {errors.current_password && <p className="text-error text-sm mt-1.5">{errors.current_password}</p>}
      </div>

      <div>
        <label htmlFor="new_password" className="font-label-caps text-label-caps text-on-surface-variant block mb-1.5">
          Nova senha<span className="text-error ml-0.5">*</span>
        </label>
        <input id="new_password" name="new_password" type="password" className={inputClass} />
        {errors.new_password && <p className="text-error text-sm mt-1.5">{errors.new_password}</p>}
      </div>

      <div>
        <label htmlFor="confirm_password" className="font-label-caps text-label-caps text-on-surface-variant block mb-1.5">
          Confirmar nova senha<span className="text-error ml-0.5">*</span>
        </label>
        <input id="confirm_password" name="confirm_password" type="password" className={inputClass} />
        {errors.confirm_password && <p className="text-error text-sm mt-1.5">{errors.confirm_password}</p>}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-background font-label-caps text-xs px-6 py-2.5 rounded-sm hover:bg-secondary transition-colors disabled:opacity-60"
      >
        {isPending ? "SALVANDO..." : "SALVAR NOVA SENHA"}
      </button>
    </form>
  );
}
