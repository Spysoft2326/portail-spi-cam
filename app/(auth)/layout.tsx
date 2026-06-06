import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";
import { Sidebar } from "@/components/ui/sidebar";
import Header from "@/components/ui/header";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar user={session?.user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}