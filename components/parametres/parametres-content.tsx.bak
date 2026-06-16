"use client";

import { useState } from "react";
import { Settings, Users, Bell, Shield, Database, Save, Check } from "lucide-react";

export default function ParametresContent() {
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
    <div>
      {/* Bouton sauvegarde */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {saved ? "Enregistré" : "Enregistrer"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar tabs */}
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
                {[
                  { label: "Alertes de validation", desc: "Notifier quand une production est à valider", checked: true },
                  { label: "Nouvelles entreprises", desc: "Notifier quand une entreprise est ajoutée", checked: true },
                  { label: "Rapports hebdomadaires", desc: "Envoyer un récapitulatif chaque lundi", checked: false },
                  { label: "Alertes de sécurité", desc: "Connexions suspectes ou échecs multiples", checked: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{item.label}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                    <input type="checkbox" defaultChecked={item.checked} className="w-5 h-5 text-blue-600 rounded" />
                  </div>
                ))}
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
          )}
        </div>
      </div>
    </div>
  );
}
