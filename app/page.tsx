"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Building2, TrendingUp, FileText, MapPin, Users, ArrowRight, Globe, Mail } from "lucide-react";

interface Stats {
  totalEntreprises: number;
  totalSecteurs: number;
  totalRegions: number;
  totalEmplois: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalEntreprises: 170,
    totalSecteurs: 23,
    totalRegions: 10,
    totalEmplois: 45000,
  });
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header - SEULEMENT Espace Professionnel */}
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
          <Link
            href="/login"
            className="px-4 py-2 bg-[#CE1126] rounded-lg text-sm font-medium hover:bg-[#a00d1e] transition-colors"
          >
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
              Données 2026 en temps réel
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              L'industrie camerounaise
              <span className="text-[#FCD116]"> en chiffres</span>
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Répertoire complet des entreprises industrielles, suivi de la production
              trimestrielle, semestrielle et annuelle. Notes de conjoncture et analyses sectorielles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/entreprises"
                className="px-8 py-3 bg-white text-[#007A3D] rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Explorer les entreprises
              </Link>
              <Link
                href="/conjoncture"
                className="px-8 py-3 bg-[#CE1126] text-white rounded-lg font-semibold hover:bg-[#a00d1e] transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Notes de conjoncture
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Building2 className="w-6 h-6" />}
            value={loading ? "..." : stats.totalEntreprises.toString()}
            label="Toutes les entreprises du secteur industriel répertoriées"
            color="bg-[#007A3D]"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            value={loading ? "..." : stats.totalSecteurs.toString()}
            label="Secteurs d'activité"
            color="bg-[#CE1126]"
          />
          <StatCard
            icon={<MapPin className="w-6 h-6" />}
            value={loading ? "..." : stats.totalRegions.toString()}
            label="Régions couvertes"
            color="bg-[#FCD116] text-black"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            value={loading ? "..." : stats.totalEmplois.toLocaleString() + "+"}
            label="Emplois industriels"
            color="bg-slate-700"
          />
        </div>
      </section>

      {/* Secteurs */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-2xl font-bold text-center mb-12">
          Secteurs industriels couverts
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SECTEURS.map((secteur) => (
            <Link
              key={secteur.code}
              href={`/entreprises?sector=${secteur.code}`}
              className="group p-4 bg-white rounded-xl border border-gray-200 hover:border-[#007A3D] hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#007A3D]/10 transition-colors">
                {secteur.icon}
              </div>
              <h4 className="font-semibold text-sm">{secteur.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{secteur.count} entreprises</p>
            </Link>
          ))}
        </div>
      </section>

      {/* À propos / Mission */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Mission du Portail SPI-CAM</h3>
              <p className="text-gray-600 mb-4">
                Le Portail de Suivi de la Production Industrielle du Cameroun (SPI-CAM) 
                est une initiative du Ministère des Mines, de l'Industrie et du Développement 
                Technologique pour centraliser et diffuser les données économiques du secteur 
                industriel camerounais.
              </p>
              <p className="text-gray-600 mb-6">
                Notre objectif : offrir un outil de transparence et d'analyse pour les 
                décideurs, les investisseurs et les professionnels du secteur industriel.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#007A3D]/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-[#007A3D]" />
                  </div>
                  <span className="text-sm text-gray-700">Couverture nationale des 10 régions</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#007A3D]/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-[#007A3D]" />
                  </div>
                  <span className="text-sm text-gray-700">Annuaire complet des entreprises industrielles</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#007A3D]/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#007A3D]" />
                  </div>
                  <span className="text-sm text-gray-700">Indicateurs économiques en temps réel</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#007A3D]/5 to-[#CE1126]/5 rounded-2xl p-8">
              <h4 className="font-bold text-lg mb-4">Accès rapide</h4>
              <div className="space-y-3">
                <Link href="/entreprises" className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition group">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-[#007A3D]" />
                    <span className="font-medium">Annuaire des entreprises</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#007A3D] transition" />
                </Link>
                <Link href="/conjoncture" className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition group">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-[#CE1126]" />
                    <span className="font-medium">Notes de conjoncture</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#CE1126] transition" />
                </Link>
                <Link href="/login" className="flex items-center justify-between p-4 bg-white rounded-xl hover:shadow-md transition group">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-slate-700" />
                    <span className="font-medium">Espace professionnel</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-slate-700 transition" />
                </Link>
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
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-6 h-6 text-[#007A3D]" />
                <span className="font-bold">Portail SPI Cam</span>
              </div>
              <p className="text-sm text-gray-400">
                Plateforme officielle de suivi de la production industrielle du Cameroun.
                Données certifiées par le MINMIDT.
              </p>
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
                <p className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  MINMIDT - Ministère des Mines, de l'Industrie et du Développement Technologique
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Yaoundé, Cameroun
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  contact@spi-cam.cm
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
            © 2026 Portail SPI Cam - Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex items-start gap-4">
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-white shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  );
}

const SECTEURS = [
  { name: "Agriculture", code: "AGRICULTURE", count: 12, icon: <span className="text-2xl">🌾</span> },
  { name: "Agroalimentaire", code: "AGROALIMENTAIRE", count: 18, icon: <span className="text-2xl">🍞</span> },
  { name: "Technologie", code: "TECHNOLOGIE", count: 8, icon: <span className="text-2xl">💻</span> },
  { name: "Télécoms", code: "TELECOMMUNICATIONS", count: 5, icon: <span className="text-2xl">📡</span> },
  { name: "E-commerce", code: "E_COMMERCE", count: 4, icon: <span className="text-2xl">🛒</span> },
  { name: "Fintech", code: "FINTECH", count: 3, icon: <span className="text-2xl">💳</span> },
  { name: "Énergie", code: "ENERGIE", count: 10, icon: <span className="text-2xl">⚡</span> },
  { name: "Mines", code: "MINES", count: 8, icon: <span className="text-2xl">⛏️</span> },
  { name: "Banque", code: "BANQUE", count: 6, icon: <span className="text-2xl">🏦</span> },
  { name: "Microfinance", code: "MICROFINANCE", count: 4, icon: <span className="text-2xl">💰</span> },
  { name: "Transport", code: "TRANSPORT", count: 7, icon: <span className="text-2xl">🚛</span> },
  { name: "Logistique", code: "LOGISTIQUE", count: 5, icon: <span className="text-2xl">📦</span> },
  { name: "Construction", code: "CONSTRUCTION", count: 9, icon: <span className="text-2xl">🏗️</span> },
  { name: "Immobilier", code: "IMMOBILIER", count: 6, icon: <span className="text-2xl">🏘️</span> },
  { name: "Santé", code: "SANTE", count: 8, icon: <span className="text-2xl">🏥</span> },
  { name: "Pharmacie", code: "PHARMACIE", count: 5, icon: <span className="text-2xl">💊</span> },
  { name: "Éducation", code: "EDUCATION", count: 7, icon: <span className="text-2xl">🎓</span> },
  { name: "Formation", code: "FORMATION", count: 4, icon: <span className="text-2xl">📚</span> },
];
