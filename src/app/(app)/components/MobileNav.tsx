"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";
import { NAV_ITEMS, BOTTOM_ITEMS } from "./nav-items";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-container-high bg-surface-container-low">
        <span className="font-headline-md text-sm tracking-widest text-primary">JURIS.CODE</span>
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOpen(true)}
          className="text-primary p-1"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative w-72 max-w-[80vw] bg-surface-container-low border-r border-surface-container-high h-full flex flex-col justify-between py-6 px-3">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-3">
                <span className="font-headline-md text-sm tracking-widest text-primary">JURIS.CODE</span>
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={() => setOpen(false)}
                  className="text-on-surface-variant hover:text-primary p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <nav className="space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active
                          ? "bg-surface-container-high text-primary font-medium"
                          : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <nav className="space-y-0.5 border-t border-surface-container-high pt-3">
              {BOTTOM_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      active
                        ? "bg-surface-container-high text-primary font-medium"
                        : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <SignOutButton />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
