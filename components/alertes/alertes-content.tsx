"use client";

import { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Users,
  Building2,
  FileText,
  X,
  Bell,
  Filter,
} from "lucide-react";

interface Alerte {
  id: string;
  type: "VALIDATION" | "NOUVELLE_ENTREPRISE" | "SECURITE" | "SYSTEME";
  titre: string;
  message: string;
  date: string;
  lu: boolean;
  priorite: "HAUTE" | "MOYENNE" | "BASSE";
  lien?: string;
}

const alertesExemples: Alerte[] = [
  {
    id: "1",
    type: "VALIDATION",
    titre: "Production à valider",
    message: "La production T2 2026 de l'entreprise ALUCAM est en attente de validation.",
    date: "2026-06-10T14:30:00",
    lu: false,
    priorite: "HAUTE",
    lien: "/dashboard/production",
  },
  {
    id: "2",
    type: "NOUVELLE_ENTREPRISE",
    titre: "Nouvelle entreprise inscrite",
    message: "L'entreprise 'Cameroun Aluminium SA' vient d'être ajoutée à l'annuaire.",
    date: "2026-06-09T10:15:00",
    lu: false,
    priorite: "MOYENNE",
    lien: "/dashboard/entreprises",
  },
  {
    id: "3",
    type: "SECURITE",
    titre: "Connexion suspecte détectée",
    message: "Tentative de connexion échouée depuis l'IP 192.168.1.45 pour l'utilisateur admin1.",
    date: "2026-06-08T22:45:00",
    lu: true,
    priorite: "HAUTE",
  },
  {
    id: "4",
    type: "SYSTEME",
    titre: "Sauvegarde effectuée",
    message: "La sauvegarde automatique de la base de données a été effectuée avec succès.",
    date: "2026-06-07T03:00:00",
    lu: true,
    priorite: "BASSE",
  },
  {
    id: "5",
    type: "VALIDATION",
    titre: "Production validée",
    message: "La production T1 2026 de l'entreprise SABC a été validée par l'administrateur.",
    date: "2026-06-06T16:20:00",
    lu: true,
    priorite: "MOYENNE",
    lien: "/dashboard/production",
  },
  {
    id: "6",
    type: "NOUVELLE_ENTREPRISE",
    titre: "Mise à jour d'entreprise",
    message: "L'entreprise 'Société Nationale des Hydrocarbures' a mis à jour ses informations.",
    date: "2026-06-05T09:30:00",
    lu: false,
    priorite: "BASSE",
    lien: "/dashboard/entreprises",
  },
];

export default function AlertesContent() {
  const [alertes, setAlertes] = useState<Alerte[]>(alertesExemples);
  const [filterType, setFilterType] = useState<string>("");
  const [filterPriorite, setFilterPriorite] = useState<string>("");
  const [showNonLusOnly, setShowNonLusOnly] = useState(false);

  const markAsRead = (id: string) => {
    setAlertes((prev) =>
      prev.map((a) => (a.id === id ? { ...a, lu: true } : a))
    );
  };

  const markAllAsRead = () => {
    setAlertes((prev) => prev.map((a) => ({ ...a, lu: true })));
  };

  const deleteAlerte = (id: string) => {
    setAlertes((prev) => prev.filter((a) => a.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "VALIDATION":
        return <FileText className="w-5 h-5 text-blue-600" />;
      case "NOUVELLE_ENTREPRISE":
        return <Building2 className="w-5 h-5 text-green-600" />;
      case "SECURITE":
        return <Shield className="w-5 h-5 text-red-600" />;
      case "SYSTEME":
        return <Bell className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "VALIDATION":
        return "Validation";
      case "NOUVELLE_ENTREPRISE":
        return "Entreprise";
      case "SECURITE":
        return "Sécurité";
      case "SYSTEME":
        return "Système";
      default:
        return "Autre";
    }
  };

  const getPrioriteBadge = (priorite: string) => {
    switch (priorite) {
      case "HAUTE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3" />
            Haute
          </span>
        );
      case "MOYENNE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3" />
            Moyenne
          </span>
        );
      case "BASSE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3" />
            Basse
          </span>
        );
      default:
        return null;
    }
  };

  const filteredAlertes = alertes.filter((a) => {
    const matchType = !filterType || a.type === filterType;
    const matchPriorite = !filterPriorite || a.priorite === filterPriorite;
    const matchLu = !showNonLusOnly || !a.lu;
    return matchType && matchPriorite && matchLu;
  });

  const nonLusCount = alertes.filter((a) => !a.lu).length;

  return (
    <div>
      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">Non lues</span>
          </div>
          <div className="text-2xl font-bold">{nonLusCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Validations</span>
          </div>
          <div className="text-2xl font-bold">
            {alertes.filter((a) => a.type === "VALIDATION").length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Entreprises</span>
          </div>
          <div className="text-2xl font-bold">
            {alertes.filter((a) => a.type === "NOUVELLE_ENTREPRISE").length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Sécurité</span>
          </div>
          <div className="text-2xl font-bold">
            {alertes.filter((a) => a.type === "SECURITE").length}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex gap-3 flex-1">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Tous les types</option>
              <option value="VALIDATION">Validation</option>
              <option value="NOUVELLE_ENTREPRISE">Entreprise</option>
              <option value="SECURITE">Sécurité</option>
              <option value="SYSTEME">Système</option>
            </select>
            <select
              value={filterPriorite}
              onChange={(e) => setFilterPriorite(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="">Toutes les priorités</option>
              <option value="HAUTE">Haute</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="BASSE">Basse</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNonLusOnly(!showNonLusOnly)}
              className={`px-4 py-2 rounded-lg transition ${
                showNonLusOnly
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Non lues uniquement
            </button>
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Tout marquer comme lu
            </button>
          </div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-3">
        {filteredAlertes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune alerte trouvée</p>
          </div>
        ) : (
          filteredAlertes.map((alerte) => (
            <div
              key={alerte.id}
              className={`bg-white rounded-xl shadow-sm p-5 transition ${
                !alerte.lu ? "border-l-4 border-blue-500" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">{getTypeIcon(alerte.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-semibold ${!alerte.lu ? "text-gray-900" : "text-gray-600"}`}>
                        {alerte.titre}
                      </h3>
                      {getPrioriteBadge(alerte.priorite)}
                      {!alerte.lu && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{alerte.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{getTypeLabel(alerte.type)}</span>
                      <span>•</span>
                      <span>{new Date(alerte.date).toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {!alerte.lu && (
                    <button
                      onClick={() => markAsRead(alerte.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Marquer comme lu"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteAlerte(alerte.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
