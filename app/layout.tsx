import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getServerSession } from "next-auth/next";
import SessionProvider from "@/components/session-provider";
import { authOptions } from "@/lib/auth";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portail SPI Cam - Suivi de la Production Industrielle du Cameroun",
  description: "Portail officiel de suivi de la production industrielle du Cameroun. Répertoire des entreprises, données de production, notes de conjoncture.",
  keywords: "Cameroun, industrie, production, entreprises, MINMIDT, conjoncture",
};

export default async function RootLayout({
  children,
}: Readonly<<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="fr">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
