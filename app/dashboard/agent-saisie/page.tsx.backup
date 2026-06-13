"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Building2, ClipboardList, Clock, CheckCircle, XCircle,
  TrendingUp, ArrowRight, Plus, FileText, AlertCircle
} from "lucide-react";

interface Stats {
  totalEntreprises: number;
  mesProductions: number;
  enAttente: number;
  validees: number;
  rejetees: number;
}

interface Production {
  id: string;
  entreprise: { denomination: string };
  annee: number;
  trimestre: number;
  statut: string;
  dateSaisie: string;
}

export default function AgentSaisieDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats>({
    totalEntreprises: 0,
    mesProductions: 0,
    enAttente: 0,
    validees: 0,
    rejetees: 0,
  });
  const [recentProductions, setRecentProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Récupérer les entreprises (toutes)
      const entRes = await fetch("/api/entreprises?limit=1");
      const entData = await entRes.json();

      // Récupérer les productions (toutes, pas seulement celles de l'agent)
      const prodRes = await fetch("/api/productions?limit=1000");
      const prodData = await prodRes.json();

      const productions = prodData.productions || [];
      // Filtrer par agent si l'ID est disponible
      const agentId = session?.user?.id;
      const mesProds = agentId ? productions.filter((p: any) => p.saisiePar === agentId) : productions;

      setStats({
        totalEntreprises: entData.total || 0,
        mesProductions: mesProds.length,
        enAttente: mesProds.filter((p: any) => p.statut === "EN_ATTENTE").length,
        validees: mesProds.filter((p: any) => p.statut === "VALIDEE").length,
        rejetees: mesProds.filter((p: any) => p.statut === "REJETEE").length,
      });

      setRecentProductions(mesProds.slice(0, 5));
    } catch (error) {
      console.error("Erreur chargement stats:", error);
      // En cas d'erreur, on garde les valeurs par défaut (0)
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "VALIDEE": return "bg-green-100 text-green-700 border-green-200";
      case "EN_ATTENTE": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "REJETEE": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case "VALIDEE": return <CheckCircle className="w-4 h-4" />;
      case "EN_ATTENTE": return <Clock className="w-4 h-4" />;
      case "REJETEE": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord — Agent de saisie</h1>
        <p className="text-gray-500 mt-1">Bienvenue, {session?.user?.name || "Agent"}</p>
      </div>

      {/* Compteurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Entreprises</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalEntreprises}</p>
          <p className="text-sm text-gray-500 mt-1">répertoriées</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Mes saisies</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.mesProductions}</p>
          <p className="text-sm text-gray-500 mt-1">productions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">En attente</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.enAttente}</p>
          <p className="text-sm text-gray-500 mt-1">à valider</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Validées</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.validees}</p>
          <p className="text-sm text-gray-500 mt-1">acceptées</p>
        </div>
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/entreprises" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition">Entreprises</h3>
                <p className="text-sm text-gray-500">Consulter et gérer les entreprises répertoriées</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" />
          </div>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              {stats.totalEntreprises} entreprises
            </span>
          </div>
        </Link>

        <Link href="/dashboard/production" className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition">Production</h3>
                <p className="text-sm text-gray-500">Saisir et consulter les données de production</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition" />
          </div>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">
              {stats.enAttente} en attente
            </span>
            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              {stats.validees} validées
            </span>
          </div>
        </Link>
      </div>

      {/* Dernières productions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            Mes dernières saisies
          </h2>
          <Link href="/dashboard/production" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentProductions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucune production saisie pour le moment</p>
            <p className="text-sm text-gray-400 mt-1">Rendez-vous sur la page Production pour saisir</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entreprise</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentProductions.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.entreprise?.denomination || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.annee} T{p.trimestre}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.statut)}`}>
                        {getStatusIcon(p.statut)}
                        {p.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right">
                      {new Date(p.dateSaisie).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
