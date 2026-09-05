"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [genericError, setGenericError] = useState("");

  function validate() {
    const next: FieldErrors = {};

    if (!name.trim()) next.name = "O nome é obrigatório.";

    if (!email.trim()) next.email = "O e-mail é obrigatório.";
    else if (!EMAIL_REGEX.test(email)) next.email = "Digite um e-mail válido.";

    if (!password) next.password = "A senha é obrigatória.";
    else if (password.length < 8) next.password = "A senha deve ter pelo menos 8 caracteres.";

    if (confirmPassword !== password) next.confirmPassword = "As senhas não coincidem.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGenericError("");
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setGenericError(data.error ?? "Não foi possível criar sua conta agora. Tente novamente em instantes.");
        return;
      }

      const result = await signIn("credentials", { redirect: false, email, password });
      setLoading(false);

      if (result?.error) {
        router.push("/login");
        return;
      }
      router.push("/dashboard");
    } catch {
      setLoading(false);
      setGenericError("Não foi possível criar sua conta agora. Tente novamente em instantes.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline-md text-headline-md text-primary mb-2">Criar uma conta</h1>
        <p className="font-body-md text-on-surface-variant">Comece a organizar sua rotina jurídica.</p>
      </div>

      {genericError && (
        <div className="border border-surface-container-high bg-surface-container rounded-md px-4 py-3">
          <p className="font-body-md text-primary text-sm">{genericError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <label htmlFor="name" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome completo"
            className="w-full bg-surface-container border border-surface-container-high rounded-md px-4 py-3 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors"
          />
          {errors.name && <p className="text-error text-sm mt-2">{errors.name}</p>}
        </div>

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
          {errors.email && <p className="text-error text-sm mt-2">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha"
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
          {errors.password && <p className="text-error text-sm mt-2">{errors.password}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Digite a senha novamente"
            className="w-full bg-surface-container border border-surface-container-high rounded-md px-4 py-3 font-body-md text-primary placeholder:text-outline focus:outline-none focus:border-accent-gray transition-colors"
          />
          {errors.confirmPassword && <p className="text-error text-sm mt-2">{errors.confirmPassword}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-background font-label-caps text-label-caps px-8 py-4 hover:bg-secondary transition-colors rounded-sm disabled:opacity-60"
        >
          {loading ? "CRIANDO CONTA..." : "CRIAR CONTA"}
        </button>
      </form>

      <p className="text-center font-body-md text-on-surface-variant">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-primary hover:text-accent-gray transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  );
}
