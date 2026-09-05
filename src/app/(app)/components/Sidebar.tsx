"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";
import { NAV_ITEMS, BOTTOM_ITEMS } from "./nav-items";

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <aside className="hidden lg:flex w-56 shrink-0 bg-surface-container-low border-r border-surface-container-high flex-col justify-between py-6 px-3">
      <div className="space-y-6">
        <Link href="/dashboard" className="font-headline-md text-sm tracking-widest text-primary block px-3">
          JURIS.CODE
        </Link>

        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <div key={item.href} className="relative">
                {active && (
                  <span className="absolute -left-3 top-1 bottom-1 w-1 bg-primary rounded-r" />
                )}
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-surface-container-high text-primary font-medium"
                      : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </div>
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
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
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
    </aside>
  );
}
