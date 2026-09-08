import Link from "next/link";

export default function FormModal({
  title,
  subtitle,
  closeHref,
  children,
}: {
  title: string;
  subtitle?: string;
  closeHref: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center p-4 py-10">
        <div className="relative w-full max-w-3xl">
          <Link
            href={closeHref}
            aria-label="Fechar"
            className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest border border-surface-container-high text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors shadow-lg"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </Link>

          <header className="mb-4 px-1">
            <h1 className="text-2xl font-semibold text-primary mb-1">{title}</h1>
            {subtitle && (
              <p className="font-body-md text-on-surface-variant text-sm">{subtitle}</p>
            )}
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
