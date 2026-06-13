"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Building2, TrendingUp, FileText, MapPin, Users, ArrowRight, Globe, Mail } from "lucide-react";

// ============================================================
// SECTEURS - SANS COMPTEURS - AVEC EMOJIS
// ============================================================
const HOME_SECTORS = [
  { name: "BTP / Matériaux", code: "BTP / Matériaux", emoji: "🏗️", color: "bg-orange-100", border: "border-orange-300", text: "text-orange-700" },
  { name: "Télécoms / IT", code: "Télécommunications / IT", emoji: "📡", color: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-700" },
  { name: "Transport / Logistique", code: "Transport / Logistique", emoji: "🚛", color: "bg-red-100", border: "border-red-300", text: "text-red-700" },
  { name: "Énergie", code: "Énergie", emoji: "⚡", color: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-700" },
  { name: "Métallurgie", code: "Métallurgie", emoji: "⚙️", color: "bg-slate-100", border: "border-slate-300", text: "text-slate-700" },
  { name: "Finance", code: "Finance", emoji: "🏦", color: "bg-cyan-100", border: "border-cyan-300", text: "text-cyan-700" },
  { name: "Pharmaceutique", code: "Pharmaceutique", emoji: "💊", color: "bg-purple-100", border: "border-purple-300", text: "text-purple-700" },
  { name: "Sécurité / Défense", code: "Sécurité / Défense", emoji: "🛡️", color: "bg-gray-100", border: "border-gray-300", text: "text-gray-700" },
  { name: "Tourisme / Hôtellerie", code: "Tourisme / Hôtellerie", emoji: "🏖️", color: "bg-pink-100", border: "border-pink-300", text: "text-pink-700" },
  { name: "Forêt / Bois", code: "Forêt / Bois", emoji: "🌲", color: "bg-green-100", border: "border-green-300", text: "text-green-700" },
  { name: "Chimie / Plastique", code: "Chimie / Plastique", emoji: "🧪", color: "bg-blue-100", border: "border-blue-300", text: "text-blue-700" },
  { name: "Environnement / Déchets", code: "Environnement / Déchets", emoji: "♻️", color: "bg-teal-100", border: "border-teal-300", text: "text-teal-700" },
  { name: "Textile / Habillement", code: "Textile / Habillement", emoji: "👕", color: "bg-rose-100", border: "border-rose-300", text: "text-rose-700" },
  { name: "Agriculture / Agro", code: "Agriculture / Agro-industrie", emoji: "🌾", color: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-700" },
  { name: "Commerce", code: "Commerce", emoji: "🛒", color: "bg-gray-100", border: "border-gray-300", text: "text-gray-700" },
  { name: "Industrie légère", code: "Industrie légère", emoji: "🏭", color: "bg-amber-100", border: "border-amber-300", text: "text-amber-700" },
];

// ============================================================
// COMPOSANT SECTEURS - RENDU UNIQUEMENT COTE CLIENT
// ============================================================
function SecteursClientOnly() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ne rien rendre cote serveur (evite le flickering)
  if (!mounted) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-center mb-4">Secteurs industriels couverts</h3>
        <p className="text-center text-gray-500 mb-12">Chargement des secteurs...</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-gray-200 animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <h3 className="text-2xl font-bold text-center mb-4">Secteurs industriels couverts</h3>
      <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
        Decouvrez les entreprises camerounaises par secteur d activite. Cliquez sur un secteur pour explorer.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {HOME_SECTORS.map((secteur) => (
          <Link 
            key={secteur.name} 
            href={`/entreprises?sector=${encodeURIComponent(secteur.code)}`} 
            className={`group p-5 bg-white rounded-2xl border ${secteur.border} hover:shadow-xl transition-all duration-300 text-center hover:border-[#007A3D]`}
          >
            <div className={`w-14 h-14 ${secteur.color} rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-3xl">{secteur.emoji}</span>
            </div>
            <h4 className={`font-semibold text-sm ${secteur.text} group-hover:text-[#007A3D] transition-colors leading-tight`}>
              {secteur.name}
            </h4>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const [stats, setStats] = useState({
    totalEntreprises: 151,
    totalSecteurs: 16,
    totalRegions: 10,
    totalEmplois: 45000,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchTotal = useCallback(async () => {
    try {
      const res = await fetch("/api/entreprises?limit=1");
      if (!res.ok) return;
      const data = await res.json();
      setStats((prev) => ({ ...prev, totalEntreprises: data.total || 151 }));
    } catch {
      // Silencieux
    }
  }, []);

  useEffect(() => {
    if (mounted) fetchTotal();
  }, [mounted, fetchTotal]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-[#007A3D] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#007A3D]" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Portail SPI Cam</h1>
              <p className="text-xs text-white/80">Suivi de la Production Industrielle</p>
            </div>
          </div>
          <Link href="/login" className="px-4 py-2 bg-[#CE1126] rounded-lg text-sm font-medium hover:bg-[#a00d1e] transition-colors">
            Espace Professionnel
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#007A3D] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02di00aC00djRoNHptLTYgNmgtNHYyaDR2LTJ6bTAtNnYtNGgtNHY0aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
              <span className="w-2 h-2 bg-[#FCD116] rounded-full animate-pulse" />
              Donnees 2026 en temps reel
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              L'industrie camerounaise
              <span className="text-[#FCD116]"> en chiffres</span>
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Repertoire complet des entreprises industrielles, suivi de la production
              trimestrielle, semestrielle et annuelle. Notes de conjoncture et analyses sectorielles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/entreprises" className="px-8 py-3 bg-white text-[#007A3D] rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />Explorer les entreprises
              </Link>
              <Link href="/conjoncture" className="px-8 py-3 bg-[#CE1126] text-white rounded-lg font-semibold hover:bg-[#a00d1e] transition-colors flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />Notes de conjoncture
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Building2 className="w-6 h-6" />} value={mounted ? stats.totalEntreprises.toString() : "151"} label="Entreprises repertoriees" color="bg-[#007A3D]" />
          <StatCard icon={<TrendingUp className="w-6 h-6" />} value={stats.totalSecteurs.toString()} label="Secteurs d'activite" color="bg-[#CE1126]" />
          <StatCard icon={<MapPin className="w-6 h-6" />} value={stats.totalRegions.toString()} label="Regions couvertes" color="bg-[#FCD116] text-black" />
          <StatCard icon={<Users className="w-6 h-6" />} value={stats.totalEmplois.toLocaleString() + "+"} label="Emplois industriels" color="bg-slate-700" />
        </div>
      </section>

      {/* Secteurs - CLIENT ONLY (pas de flickering) */}
      <SecteursClientOnly />

      {/* A propos */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Mission du Portail SPI-CAM</h3>
              <p className="text-gray-600 mb-4">Le Portail de Suivi de la Production Industrielle du Cameroun (SPI-CAM) est une initiative du Ministere des Mines, de l'Industrie et du Developpement Technologique pour centraliser et diffuser les donnees economiques du secteur industriel camerounais.</p>
              <p className="text-gray-600 mb-6">Notre objectif : offrir un outil de transparence et d'analyse pour les decideurs, les investisseurs et les professionnels du secteur industriel.</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-[#007A3D]/10 rounded-lg flex items-center justify-center"><Globe className="w-4 h-4 text-[#007A3D]" /></div><span className="text-sm text-gray-700">Couverture nationale des 10 regions</span></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-[#007A3D]/10 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-[#007A3D]" /></div><span className="text-sm text-gray-700">Annuaire complet des entreprises industrielles</span></div>
                <div className="flex items-center gap-3"><div className="w-8 h-8 bg-[#007A3D]/10 rounded-lg flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[#007A3D]" /></div><span className="text-sm text-gray-700">Indicateurs economiques en temps reel</span></div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#007A3D]/5 to-[#CE1126]/5 rounded-2xl p-8">
              <h4 className="font-bold text-lg mb-4">Acces rapide</h4>
              <div className="space-y-3">
                <Link href="/entreprises" className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition group"><div className="flex items-center gap-3"><Building2 className="w-5 h-5 text-[#007A3D]" /><span className="font-medium">Annuaire des entreprises</span></div><ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#007A3D] transition" /></Link>
                <Link href="/conjoncture" className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition group"><div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-[#CE1126]" /><span className="font-medium">Notes de conjoncture</span></div><ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#CE1126] transition" /></Link>
                <Link href="/login" className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition group"><div className="flex items-center gap-3"><Users className="w-5 h-5 text-slate-700" /><span className="font-medium">Espace professionnel</span></div><ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-slate-700 transition" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4"><Building2 className="w-6 h-6 text-[#007A3D]" /><span className="font-bold">Portail SPI Cam</span></div>
              <p className="text-sm text-gray-400">Plateforme officielle de suivi de la production industrielle du Cameroun. Donnees certifiees par le MINMIDT.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/entreprises" className="hover:text-white">Repertoire des entreprises</Link></li>
                <li><Link href="/conjoncture" className="hover:text-white">Notes de conjoncture</Link></li>
                <li><Link href="/login" className="hover:text-white">Espace professionnel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p className="flex items-center gap-2"><Globe className="w-4 h-4" />MINMIDT - Ministere des Mines, de l'Industrie et du Developpement Technologique</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />Yaounde, Cameroun</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" />contact@spi-cam.cm</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">(c) 2026 Portail SPI Cam - Tous droits reserves</div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white shrink-0`}>{icon}</div>
      <div><div className="text-2xl font-bold">{value}</div><div className="text-sm text-gray-500">{label}</div></div>
    </div>
  );
}
