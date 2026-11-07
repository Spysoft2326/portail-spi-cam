"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Building2, TrendingUp, FileText, MapPin, Users, Globe, Mail, ClipboardCheck, BarChart3, Target } from "lucide-react";

const MISSIONS = [
  {
    titre: "Recenser le tissu industriel",
    texte: "Tenir un annuaire à jour des entreprises et de leurs établissements, classés par activité selon la nomenclature officielle et par filière.",
    icone: <Building2 className="w-6 h-6 text-[#007A3D]" />,
    couleur: "bg-[#007A3D]/10",
  },
  {
    titre: "Suivre la production",
    texte: "Collecter chaque trimestre la production des entreprises, produit par produit, avec leur chiffre d'affaires et leurs effectifs.",
    icone: <ClipboardCheck className="w-6 h-6 text-[#CE1126]" />,
    couleur: "bg-[#CE1126]/10",
  },
  {
    titre: "Éclairer la conjoncture",
    texte: "Produire des indicateurs et des notes de conjoncture pour mesurer l'évolution de l'activité industrielle, filière par filière.",
    icone: <BarChart3 className="w-6 h-6 text-amber-600" />,
    couleur: "bg-[#FCD116]/25",
  },
  {
    titre: "Appuyer la politique industrielle",
    texte: "Fournir aux décideurs et aux investisseurs une base de pilotage des filières prioritaires de la SND30 et de la transformation locale.",
    icone: <Target className="w-6 h-6 text-slate-700" />,
    couleur: "bg-slate-100",
  },
];

const ETAPES = [
  { titre: "Saisie", texte: "Les agents du MINMIDT enregistrent les entreprises et leurs déclarations trimestrielles de production." },
  { titre: "Contrôle", texte: "Un administrateur vérifie chaque saisie, la valide ou la renvoie avec un motif pour correction." },
  { titre: "Publication", texte: "Seules les données validées alimentent l'annuaire public et les notes de conjoncture." },
];

export default function HomePage() {
  const [stats, setStats] = useState({ totalEntreprises: 0, totalFilieres: 0, totalRegions: 0, totalEmplois: 0 });
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { setMounted(true); }, []);
  const fetchTotal = useCallback(async () => {
    try {
      const res = await fetch("/api/entreprises/count");
      if (!res.ok) return;
      const data = await res.json();
      setStats((prev) => ({ ...prev, totalEntreprises: data.count || 0, totalRegions: data.regions || 0, totalEmplois: data.emplois || 0 }));
    } catch { }
  }, []);
  const fetchFilieres = useCallback(async () => {
    try {
      const res = await fetch("/api/entreprises/sectors");
      if (!res.ok) return;
      const data = await res.json();
      setStats((prev) => ({ ...prev, totalFilieres: (data.filieres || []).length }));
    } catch { }
  }, []);
  useEffect(() => {
    if (mounted) {
      Promise.all([fetchTotal(), fetchFilieres()]).finally(() => { setLoading(false); });
    }
  }, [mounted, fetchTotal, fetchFilieres]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
          <Link href="/login" className="px-4 py-2 bg-[#CE1126] rounded-lg text-sm font-medium hover:bg-[#a00d1e] transition-colors">Espace Professionnel</Link>
        </div>
      </header>

      <section className="relative bg-[#007A3D] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02di00aC00djRoNHptLTYgNmgtNHYyaDR2LTJ6mTAtNnYtNGgtNHY0aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-6">
              <span className="w-2 h-2 bg-[#FCD116] rounded-full animate-pulse" />
              Données en temps réel
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">L'industrie camerounaise<span className="text-[#FCD116]"> en chiffres</span></h2>
            <p className="text-lg text-white/80 mb-8">Répertoire complet des entreprises industrielles, suivi de la production trimestrielle, semestrielle et annuelle. Notes de conjoncture et analyses sectorielles.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/entreprises" className="px-8 py-3 bg-white text-[#007A3D] rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"><Search className="w-5 h-5" />Explorer les entreprises</Link>
              <Link href="/conjoncture" className="px-8 py-3 bg-[#CE1126] text-white rounded-lg font-semibold hover:bg-[#a00d1e] transition-colors flex items-center justify-center gap-2"><FileText className="w-5 h-5" />Notes de conjoncture</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-7 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon={<Building2 className="w-4 h-4" />} value={mounted ? stats.totalEntreprises.toString() : "--"} label="Entreprises répertoriées" color="bg-[#007A3D]" />
          <StatCard icon={<TrendingUp className="w-4 h-4" />} value={mounted && stats.totalFilieres ? stats.totalFilieres.toString() : "--"} label="Filières industrielles" color="bg-[#CE1126]" />
          <StatCard icon={<MapPin className="w-4 h-4" />} value={mounted && stats.totalRegions ? stats.totalRegions.toString() : "--"} label="Régions couvertes" color="bg-[#FCD116] text-black" />
          <StatCard icon={<Users className="w-4 h-4" />} value={mounted && stats.totalEmplois ? stats.totalEmplois.toLocaleString("fr-FR") : "--"} label="Emplois déclarés" color="bg-slate-700" />
        </div>
      </section>

      {/* ---------------------------------------------------------------- Missions */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-semibold tracking-wider uppercase text-[#007A3D] mb-3">Nos missions</p>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Un outil public au service de l'industrialisation du Cameroun</h3>
          <p className="text-gray-600 text-lg">
            Le Portail de Suivi de la Production Industrielle (SPI-CAM), porté par le Ministère des Mines, de l'Industrie et du
            Développement Technologique (MINMIDT), centralise, fiabilise et diffuse les données du secteur industriel camerounais.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MISSIONS.map((m, k) => (
            <div key={m.titre} className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-[#007A3D]/40 transition-all duration-300">
              <span className="absolute top-5 right-6 text-4xl font-bold text-gray-100 group-hover:text-[#007A3D]/10 transition-colors select-none">{String(k + 1).padStart(2, "0")}</span>
              <div className={`w-12 h-12 ${m.couleur} rounded-xl flex items-center justify-center mb-5`}>{m.icone}</div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">{m.titre}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{m.texte}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- Comment ça marche */}
      <section className="bg-white border-y border-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            <div>
              <p className="text-sm font-semibold tracking-wider uppercase text-[#CE1126] mb-3">Des données fiables</p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Chaque chiffre publié a été vérifié</h3>
              <p className="text-gray-600">
                Les données suivent un circuit de validation : elles ne sont rendues publiques qu'après contrôle par
                l'administration. Les activités sont classées selon la nomenclature officielle (NACAM, fondée sur la CITI Rév.4 des Nations Unies).
              </p>
            </div>
            <ol className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
              {ETAPES.map((e, k) => (
                <li key={e.titre} className="relative bg-slate-50 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-full bg-[#007A3D] text-white font-bold flex items-center justify-center shrink-0">{k + 1}</span>
                    <h4 className="font-bold text-gray-900">{e.titre}</h4>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{e.texte}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4"><Building2 className="w-6 h-6 text-[#007A3D]" /><span className="font-bold">Portail SPI Cam</span></div>
              <p className="text-sm text-gray-400">Plateforme officielle de suivi de la production industrielle du Cameroun, mise en œuvre par le MINMIDT. Données validées avant publication.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liens rapides</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/entreprises" className="hover:text-white">Répertoire des entreprises</Link></li>
                <li><Link href="/conjoncture" className="hover:text-white">Notes de conjoncture</Link></li>
                <li><Link href="/login" className="hover:text-white">Espace professionnel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p className="flex items-center gap-2"><Globe className="w-4 h-4" />MINMIDT - Ministère des Mines, de l'Industrie et du Développement Technologique</p>
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4" />Yaoundé, Cameroun</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" />contact@spi-cam.cm</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">© 2026 Portail SPI Cam - Tous droits réservés</div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string; label: string; color: string }) {
  return (
    <div className="bg-white rounded-lg shadow-lg px-3 py-2.5 flex items-center gap-3">
      <div className={`w-8 h-8 ${color} rounded-md flex items-center justify-center text-white shrink-0`}>{icon}</div>
      <div className="min-w-0"><div className="text-xl font-bold leading-tight">{value}</div><div className="text-xs text-gray-500 truncate">{label}</div></div>
    </div>
  );
}
