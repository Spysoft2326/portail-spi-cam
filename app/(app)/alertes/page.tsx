"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Check, X, AlertTriangle, Info, Calendar, Filter } from "lucide-react";

interface Alerte {
  id: string;
  type: "info" | "warning" | "error" | "success";
  titre: string;
  message: string;
  date: string;
  lue: boolean;
  categorie: string;
}

export default function AlertesPage() {
  const [alertes, setAlertes] = useState<Alerte[]>([
    { id: "1", type: "warning", titre: "Production en attente", message: "3 données de production nécessitent une validation", date: "09/06/2026 14:30", lue: false, categorie: "Validation" },
    { id: "2", type: "info", titre: "Nouvelle entreprise", message: "COTCO a été ajoutée à l'annuaire", date: "09/06/2026 12:15", lue: false, categorie: "Entreprises" },
    { id: "3", type: "success", titre: "Validation confirmée", message: "La production de ALUCAM T1 2026 a été validée", date: "09/06/2026 10:45", lue: true, categorie: "Validation" },
    { id: "4", type: "error", titre: "Échec de connexion", message: "Tentatives multiples depuis l'IP 192.168.1.45", date: "08/06/2026 18:20", lue: false, categorie: "Sécurité" },
    { id: "5", type: "info", titre: "Mise à jour système", message: "Le portail sera indisponible le 15/06 à 02:00", date: "08/06/2026 09:00", lue: true, categorie: "Système" },
    { id: "6", type: "warning", titre: "Données incomplètes", message: "5 entreprises n'ont pas de production T1 2026", date: "07/06/2026 16:30", lue: true, categorie: "Données" },
  ]);

  const [filtreType, setFiltreType] = useState("");
  const [filtreLue, setFiltreLue] = useState("");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "error": return <X className="w-5 h-5 text-red-500" />;
      case "success": return <Check className="w-5 h-5 text-green-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "warning": return "bg-amber-50 border-amber-200";
      case "error": return "bg-red-50 border-red-200";
      case "success": return "bg-green-50 border-green-200";
      default: return "bg-blue-50 border-blue-200";
    }
  };

  const marquerLue = (id: string) => {
    setAlertes(alertes.map(a => a.id === id ? { ...a, lue: true } : a));
  };

  const marquerToutesLues = () => {
    setAlertes(alertes.map(a => ({ ...a, lue: true })));
  };

  const alertesFiltrees = alertes.filter(a => {
    if (filtreType && a.type !== filtreType) return false;
    if (filtreLue === "lue" && !a.lue) return false;
    if (filtreLue === "non-lue" && a.lue) return false;
    return true;
  });

  const nonLues = alertes.filter(a => !a.lue).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Centre de notifications</h1>
            </div>
            <p className="text-gray-500">Gestion des alertes et notifications du portail</p>
          </div>
          <div className="flex items-center gap-3">
            {nonLues > 0 && (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {nonLues} non lue{nonLues > 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={marquerToutesLues}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Tout marquer comme lu
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filtrer :</span>
            </div>
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="info">Information</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
              <option value="success">Succès</option>
            </select>
            <select
              value={filtreLue}
              onChange={(e) => setFiltreLue(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="non-lue">Non lues</option>
              <option value="lue">Lues</option>
            </select>
          </div>
        </div>

        {/* Liste */}
        <div className="space-y-4">
          {alertesFiltrees.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune alerte à afficher</p>
            </div>
          ) : (
            alertesFiltrees.map((alerte) => (
              <div
                key={alerte.id}
                className={`bg-white rounded-xl shadow-sm border-l-4 p-6 transition ${
                  alerte.lue ? "border-gray-300 opacity-75" : getTypeColor(alerte.type)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getTypeIcon(alerte.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={`font-semibold ${alerte.lue ? "text-gray-600" : "text-gray-900"}`}>
                          {alerte.titre}
                        </h3>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          {alerte.categorie}
                        </span>
                        {!alerte.lue && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                      </div>
                      <p className={`text-sm ${alerte.lue ? "text-gray-400" : "text-gray-600"}`}>{alerte.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {alerte.date}
                      </div>
                    </div>
                  </div>
                  {!alerte.lue && (
                    <button
                      onClick={() => marquerLue(alerte.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 transition"
                    >
                      Marquer comme lu
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
