import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/auth";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="app-shell min-h-screen flex flex-col lg:flex-row bg-background">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 min-w-0 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-6">{children}</main>
    </div>
  );
}
