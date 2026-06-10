"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  BarChart3,
  Shield,
  Search,
  Building2,
  Activity,
  Clock
} from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
}

interface Production {
  id: string;
  annee: number;
  trimestre: number;
  productionPhysique: number;
  chiffreAffaires: number;
  effectifs: number;
  statut: string;
  entreprise: {
    denomination: string;
  };
  agent: {
    name: string | null;
  };
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalAgents: number;
  totalAdmins: number;
  productionsEnAttente: number;
  productionsValidees: number;
  productionsRejetees: number;
  totalEntreprises: number;
}

export default function AnalyticsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "productions" | "analytics">("overview");
  const [users, setUsers] = useState<User[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard/agent");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) setStats(await statsRes.json());

      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) setUsers(await usersRes.json());

      const prodRes = await fetch("/api/admin/productions");
      if (prodRes.ok) setProductions(await prodRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateProduction = async (id: string, action: "validate" | "reject") => {
    try {
      const res = await fetch(`/api/admin/productions/${id}/${action}`, { method: "POST" });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch = !searchUser ||
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const filteredProductions = productions.filter((p) => !filterStatus || p.statut === filterStatus);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { id: "overview", label: "Vue d'ensemble", icon: Activity },
          { id: "users", label: "Utilisateurs", icon: Users },
          { id: "productions", label: "Productions", icon: BarChart3 },
          { id: "analytics", label: "Analytics", icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === tab.id ? "bg-[#007A3D] text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Utilisateurs</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-sm text-gray-500 mt-1">{stats.totalAgents} agents, {stats.totalAdmins} admins</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-sm text-gray-500">En attente</span>
              </div>
              <div className="text-2xl font-bold">{stats.productionsEnAttente}</div>
              <div className="text-sm text-gray-500 mt-1">Productions à valider</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Validées</span>
              </div>
              <div className="text-2xl font-bold">{stats.productionsValidees}</div>
              <div className="text-sm text-gray-500 mt-1">Productions validées</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Entreprises</span>
              </div>
              <div className="text-2xl font-bold">{stats.totalEntreprises}</div>
              <div className="text-sm text-gray-500 mt-1">Dans l'annuaire</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Dernières productions en attente</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Entreprise</th>
                    <th className="text-left py-3 px-4">Période</th>
                    <th className="text-right py-3 px-4">Production</th>
                    <th className="text-right py-3 px-4">CA</th>
                    <th className="text-left py-3 px-4">Agent</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productions.filter((p) => p.statut === "EN_ATTENTE").slice(0, 5).map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{p.entreprise.denomination}</td>
                      <td className="py-3 px-4">{p.annee} T{p.trimestre}</td>
                      <td className="py-3 px-4 text-right">{p.productionPhysique.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{p.chiffreAffaires.toLocaleString()}</td>
                      <td className="py-3 px-4">{p.agent.name || "N/A"}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => validateProduction(p.id, "validate")} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition" title="Valider">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => validateProduction(p.id, "reject")} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Rejeter">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Gestion des utilisateurs</h2>
            <div className="flex gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" value={searchUser} onChange={(e) => setSearchUser(e.target.value)} placeholder="Rechercher..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="">Tous les rôles</option>
                <option value="AGENT_SAISIE">Agent</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Nom</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Rôle</th>
                  <th className="text-left py-3 px-4">Date d'inscription</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{u.name || "N/A"}</td>
                    <td className="py-3 px-4">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>{u.role}</span>
                    </td>
                    <td className="py-3 px-4">{new Date(u.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        {u.role !== 'SUPER_ADMIN' && (
                          <select value={u.role} onChange={(e) => changeUserRole(u.id, e.target.value)} className="text-sm border border-gray-300 rounded-lg px-2 py-1">
                            <option value="AGENT_SAISIE">Agent</option>
                            <option value="ADMIN">Admin</option>
                            {session?.user?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Productions Tab */}
      {activeTab === "productions" && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Gestion des productions</h2>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDEE">Validée</option>
              <option value="REJETEE">Rejetée</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Entreprise</th>
                  <th className="text-left py-3 px-4">Période</th>
                  <th className="text-right py-3 px-4">Production</th>
                  <th className="text-right py-3 px-4">CA</th>
                  <th className="text-right py-3 px-4">Effectifs</th>
                  <th className="text-left py-3 px-4">Agent</th>
                  <th className="text-center py-3 px-4">Statut</th>
                  <th className="text-center py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProductions.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{p.entreprise.denomination}</td>
                    <td className="py-3 px-4">{p.annee} T{p.trimestre}</td>
                    <td className="py-3 px-4 text-right">{p.productionPhysique.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{p.chiffreAffaires.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{p.effectifs}</td>
                    <td className="py-3 px-4">{p.agent.name || "N/A"}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        p.statut === 'VALIDEE' ? 'bg-green-100 text-green-800' :
                        p.statut === 'EN_ATTENTE' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}>{p.statut}</span>
                    </td>
                    <td className="py-3 px-4">
                      {p.statut === "EN_ATTENTE" && (
                        <div className="flex justify-center gap-2">
                          <button onClick={() => validateProduction(p.id, "validate")} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition" title="Valider">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => validateProduction(p.id, "reject")} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition" title="Rejeter">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Statistiques globales</h2>
            <p className="text-gray-500">Les graphiques détaillés sont disponibles dans la section Notes de Conjoncture.</p>
            <div className="mt-4">
              <Link href="/conjoncture" className="inline-flex items-center gap-2 px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#005a2d] transition">
                <TrendingUp className="w-4 h-4" />
                Voir les analyses détaillées
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
