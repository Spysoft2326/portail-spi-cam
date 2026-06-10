"use client";

import { useState, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Se connecter sans redirection automatique
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        console.error("Erreur de connexion:", result.error);
        setLoading(false);
        return;
      }

      // 2. Récupérer la session pour connaître le rôle
      const session = await getSession();
      const role = session?.user?.role;

      // 3. Rediriger selon le rôle
      let redirectUrl = "/dashboard/agent-saisie"; // Par défaut

      if (role === "SUPER_ADMIN" || role === "ADMIN") {
        redirectUrl = "/dashboard/admin";
      } else if (role === "AGENT_SAISIE") {
        redirectUrl = "/dashboard/agent-saisie";
      }

      // Si un callbackUrl est fourni dans l'URL, l'utiliser (sauf si c'est la page de login)
      if (callbackUrl && callbackUrl !== "/login") {
        redirectUrl = callbackUrl;
      }

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Portail SPI-Cam</h1>
        <p className="text-center text-slate-500 mb-8">Connexion à votre espace</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error === "CredentialsSignin"
              ? "Email ou mot de passe incorrect"
              : "Une erreur est survenue"}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-6">Portail SPI-Cam</h1>
          <p className="text-center text-slate-500">Chargement...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
