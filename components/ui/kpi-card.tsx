import type { ReactNode } from "react";

/**
 * Carte d'indicateur commune à toutes les pages de l'espace connecté (format compact).
 * `accent` : couleur de la pastille d'icône (classes Tailwind, ex. "bg-blue-100 text-blue-600").
 */
export function KpiCard({
  label,
  value,
  sub,
  icon,
  accent = "bg-gray-100 text-gray-600",
  onClick,
  actif,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  icon?: ReactNode;
  accent?: string;
  onClick?: () => void;
  actif?: boolean;
}) {
  const contenu = (
    <>
      {icon && <div className={`w-8 h-8 rounded-md flex items-center justify-center text-base shrink-0 ${accent}`}>{icon}</div>}
      <div className="min-w-0 text-left">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{typeof value === "number" ? value.toLocaleString("fr-FR") : value}</p>
        {sub && <p className="text-[11px] text-gray-400 truncate">{sub}</p>}
      </div>
    </>
  );
  const classes = `w-full bg-white rounded-lg border px-3 py-2.5 flex items-center gap-3 shadow-sm ${actif ? "border-[#007A3D] ring-1 ring-[#007A3D]" : "border-gray-200"}`;
  return onClick ? (
    <button type="button" onClick={onClick} className={`${classes} hover:border-gray-300 transition`}>{contenu}</button>
  ) : (
    <div className={classes}>{contenu}</div>
  );
}

/** Grille standard des cartes d'indicateurs. */
export function KpiGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">{children}</div>;
}
