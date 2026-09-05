import Link from "next/link";

function GlowLines() {
  return (
    <div
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none flex items-center justify-center"
      style={{
        maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
      }}
    >
      <svg
        width="100%"
        height="150%"
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        className="w-full h-full opacity-80 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <path className="string-line" d="M -100 400 Q 360 150 720 400 T 1540 400" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" style={{ animationDelay: "0s", animationDuration: "8s" }} />
        <path className="string-line" d="M -100 400 Q 360 650 720 400 T 1540 400" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" style={{ animationDelay: "-2s", animationDuration: "11s" }} />
        <path className="string-line" d="M -100 400 Q 360 250 720 400 T 1540 400" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" style={{ animationDelay: "-4s", animationDuration: "6s" }} />
        <path className="string-line" d="M -100 400 Q 360 550 720 400 T 1540 400" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" style={{ animationDelay: "-6s", animationDuration: "14s" }} />
      </svg>
    </div>
  );
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex">
      {/* Painel de marca — oculto em telas pequenas */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-14 bg-surface-container-low border-r border-surface-container-high overflow-hidden">
        <GlowLines />

        <Link href="/" className="font-headline-md text-headline-md tracking-widest text-primary">
          JURIS.CODE
        </Link>

        <div className="max-w-md">
          <h2 className="font-square text-headline-lg text-primary mb-6 font-bold tracking-tight leading-tight">
            Sua rotina jurídica,<br />sob controle.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            Organize clientes, processos, prazos, tarefas e compromissos em um único lugar — sem depender da memória ou de planilhas soltas.
          </p>
        </div>

        <span className="font-label-caps text-label-caps text-outline tracking-widest">
          FOCO JURÍDICO · ORGANIZAÇÃO INTELIGENTE
        </span>
      </div>

      {/* Painel do formulário */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-margin-mobile py-16 relative bg-background">
        <div className="lg:hidden">
          <GlowLines />
        </div>

        <Link
          href="/"
          className="lg:hidden font-headline-md text-headline-md tracking-widest text-primary mb-10"
        >
          JURIS.CODE
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
