"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type FormState = "idle" | "loading" | "invalid-credentials" | "unavailable";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [state, setState] = useState<FormState>("idle");

  const stateMessage: Record<Exclude<FormState, "idle" | "loading">, string> = {
    "invalid-credentials": "E-mail ou senha incorretos. Verifique e tente novamente.",
    "unavailable": "Não foi possível entrar no momento. Tente novamente em instantes.",
  };

  function validate() {
    let valid = true;
    if (!email.trim()) {
      setEmailError("O e-mail é obrigatório.");
      valid = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError("Digite um e-mail válido.");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("A senha é obrigatória.");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setState("loading");

    try {
      const result = await signIn("credentials", { redirect: false, email, password });
      if (result?.error) {
        setState("invalid-credentials");
        return;
      }
      router.push("/dashboard");
    } catch {
      setState("unavailable");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline-md text-headline-md text-primary mb-2">Entrar</h1>
        <p className="font-body-md text-on-surface-variant">Acesse sua rotina jurídica.</p>
      </div>

      {state !== "idle" && state !== "loading" && (
        <div className="border border-surface-container-high bg-surface-container rounded-md px-4 py-3">
          <p className="font-body-md text-primary text-sm">{stateMessage[state]}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <label htmlFor="email" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite seu e-mail"
            className="w-full bg-surface-container border border-surface-container-high rounded-md px-4 py-3 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors"
          />
          {emailError && <p className="text-error text-sm mt-2">{emailError}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="font-label-caps text-label-caps text-on-surface-variant">
              Senha
            </label>
            <button
              type="button"
              className="font-body-md text-on-surface-variant text-sm hover:text-primary transition-colors"
            >
              Esqueci minha senha
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="w-full bg-surface-container border border-surface-container-high rounded-md px-4 py-3 pr-12 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar senha" : "Visualizar senha"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {passwordError && <p className="text-error text-sm mt-2">{passwordError}</p>}
        </div>

        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full bg-primary text-background font-label-caps text-label-caps px-8 py-4 hover:bg-secondary transition-colors rounded-sm disabled:opacity-60"
        >
          {state === "loading" ? "ENTRANDO..." : "ENTRAR"}
        </button>
      </form>

      <p className="text-center font-body-md text-on-surface-variant">
        Não tem uma conta?{" "}
        <Link href="/register" className="text-primary hover:text-accent-gray transition-colors">
          Criar uma conta
        </Link>
      </p>
    </div>
  );
}
