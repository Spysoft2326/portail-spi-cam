import Link from "next/link";
import { Search, Building2, TrendingUp, FileText, MapPin, Users } from "lucide-react";

export default function HomePage() {
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
          <div className="flex items-center gap-4">
            <Link
              href="/entreprises"
              className="text-sm hover:text-[#FCD116] transition-colors"
            >
              Entreprises
            </Link>
            <Link
              href="/notes-conjoncture"
              className="text-sm hover:text-[#FCD116] transition-colors"
            >
              Notes de Conjoncture
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-[#CE1126] rounded-lg text-sm font-medium hover:bg-[#a00d1e] transition-colors"
            >
              Espace Professionnel
            </Link>
          </div>
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
                href="/notes-conjoncture"
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
            value="100"
            label="Entreprises répertoriées"
            color="bg-[#007A3D]"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            value="11"
            label="Secteurs d'activité"
            color="bg-[#CE1126]"
          />
          <StatCard
            icon={<MapPin className="w-6 h-6" />}
            value="10"
            label="Régions couvertes"
            color="bg-[#FCD116] text-black"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            value="45,000+"
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
              key={secteur.name}
              href={`/entreprises?secteur=${secteur.code}`}
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
                <li><Link href="/notes-conjoncture" className="hover:text-white">Notes de conjoncture</Link></li>
                <li><Link href="/login" className="hover:text-white">Espace professionnel</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-sm text-gray-400">
                MINMIDT - Ministère des Mines, de l'Industrie et du Développement Technologique<br />
                Yaoundé, Cameroun<br />
                contact@spi-cam.cm
              </p>
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
  { name: "Agroalimentaire", code: "AGROALIMENTAIRE", count: 28, icon: <span className="text-2xl">🌾</span> },
  { name: "Mines", code: "MINES_ET_CARRIERES", count: 12, icon: <span className="text-2xl">⛏️</span> },
  { name: "Textile", code: "TEXTILE_ET_HABILLEMENT", count: 8, icon: <span className="text-2xl">👔</span> },
  { name: "Métallurgie", code: "METALLURGIE_ET_SIDERURGIE", count: 10, icon: <span className="text-2xl">🔧</span> },
  { name: "BTP", code: "CONSTRUCTION_ET_BTP", count: 15, icon: <span className="text-2xl">🏗️</span> },
  { name: "Énergie", code: "ENERGIE_ET_EAU", count: 8, icon: <span className="text-2xl">⚡</span> },
  { name: "Chimie", code: "CHIMIE_ET_PHARMACIE", count: 10, icon: <span className="text-2xl">🧪</span> },
  { name: "Mécanique", code: "MECANIQUE_ET_ELECTRIQUE", count: 12, icon: <span className="text-2xl">⚙️</span> },
  { name: "Bois", code: "BOIS_ET_PAPETERIE", count: 6, icon: <span className="text-2xl">🌲</span> },
  { name: "TIC", code: "TIC_ET_NUMERIQUE", count: 10, icon: <span className="text-2xl">💻</span> },
  { name: "Autres", code: "AUTRE", count: 2, icon: <span className="text-2xl">📦</span> },
];
