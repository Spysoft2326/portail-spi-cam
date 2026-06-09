"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Users, Bell, Shield, Database, ArrowLeft, Save, Check } from "lucide-react";

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: "general", label: "Général", icon: Settings },
    { id: "utilisateurs", label: "Utilisateurs", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "securite", label: "Sécurité", icon: Shield },
    { id: "donnees", label: "Données", icon: Database },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Link href="/dashboard/super-admin" className="text-blue-200 hover:text-white transition">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl font-bold">Paramètres système</h1>
              </div>
              <p className="text-blue-200 text-lg">
                Configuration et administration du portail SPI-CAM
              </p>
            </div>
            <button
              onClick={handleSave}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              {saved ? "Enregistré" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition ${
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === "general" && (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Paramètres généraux</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du portail</label>
                    <input type="text" defaultValue="Portail SPI-CAM" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
                    <input type="email" defaultValue="contact@spi-cam.cm" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Langue par défaut</label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500">
                      <option>Français</option>
                      <option>Anglais</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fuseau horaire</label>
                    <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500">
                      <option>Africa/Douala (WAT)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Apparence</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#007A3D]"></div>
                    <div className="w-12 h-12 rounded-lg bg-[#CE1126]"></div>
                    <div className="w-12 h-12 rounded-lg bg-[#FCD116]"></div>
                    <span className="text-sm text-gray-500">Couleurs du Cameroun (défaut)</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "utilisateurs" && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestion des utilisateurs</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Super-Administrateurs</div>
                      <div className="text-sm text-gray-500">Accès complet au système</div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">2 actifs</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Administrateurs</div>
                      <div className="text-sm text-gray-500">Gestion des données et validations</div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">5 actifs</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">Agents de saisie</div>
                      <div className="text-sm text-gray-500">Saisie des données de production</div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">12 actifs</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration des alertes</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Alertes de validation</div>
                      <div className="text-sm text-gray-500">Notifier quand une production est à valider</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Nouvelles entreprises</div>
                      <div className="text-sm text-gray-500">Notifier quand une entreprise est ajoutée</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Rapports hebdomadaires</div>
                      <div className="text-sm text-gray-500">Envoyer un récapitulatif chaque lundi</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Alertes de sécurité</div>
                      <div className="text-sm text-gray-500">Connexions suspectes ou échecs multiples</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "securite" && (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sécurité et accès</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durée de session (minutes)</label>
                    <input type="number" defaultValue="30" className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tentatives de connexion max</label>
                    <input type="number" defaultValue="5" className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Authentification à deux facteurs</div>
                      <div className="text-sm text-gray-500">Obligatoire pour les super-admin</div>
                    </div>
                    <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Journal d'audit</div>
                      <div className="text-sm text-gray-500">Enregistrer toutes les actions</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "donnees" && (
              <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Gestion des données</h2>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-900">Base de données</div>
                    <div className="text-sm text-blue-700 mt-1">SQLite - 150 entreprises enregistrées</div>
                    <div className="text-sm text-blue-700">Dernière sauvegarde : 09/06/2026</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-left">
                      <div className="font-medium text-gray-900">Exporter les données</div>
                      <div className="text-sm text-gray-500">CSV, JSON, Excel</div>
                    </button>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-left">
                      <div className="font-medium text-gray-900">Importer des données</div>
                      <div className="text-sm text-gray-500">Fichier CSV ou Excel</div>
                    </button>
                  </div>

                  <div className="border-t pt-4">
                    <div className="font-medium text-red-600 mb-2">Zone dangereuse</div>
                    <button className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition">
                      Réinitialiser les données de démonstration
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>2026 Portail SPI-CAM - Ministère de l'Industrie du Cameroun</p>
            <div className="flex gap-4">
              <Link href="/dashboard/super-admin" className="hover:text-blue-600 transition">Tableau de bord</Link>
              <Link href="/entreprises" className="hover:text-blue-600 transition">Annuaire</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
