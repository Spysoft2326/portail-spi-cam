"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { useSession } from "next-auth/react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        userRole={session?.user?.role || "SUPER_ADMIN"}
        userName={session?.user?.name || "Utilisateur"}
        userEmail={session?.user?.email || ""}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}