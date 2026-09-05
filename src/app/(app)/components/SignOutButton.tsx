"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors w-full text-left"
    >
      <span className="material-symbols-outlined text-[20px]">logout</span>
      <span>Sair</span>
    </button>
  );
}
