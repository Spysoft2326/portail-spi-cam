"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Settings, Users, Bell, Shield, Database } from "lucide-react";
import UsersContent from "@/components/parametres/users-content";
import NotificationsContent from "@/components/parametres/notifications-content";
import SecurityContent from "@/components/parametres/security-content";
import DataContent from "@/components/parametres/data-content";

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  emailVerified: Date | null;
}

const tabs = [
  { id: "general", label: "General", icon: Settings },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Securite", icon: Shield },
  { id: "data", label: "Donnees", icon: Database },
];

function ParametresContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "general");
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [generalSettings, setGeneralSettings] = useState({
    nomPortail: "Portail SPI-CAM",
    emailContact: "contact@spi-cam.cm",
    langue: "fr",
    fuseauHoraire: "Africa/Douala",
  });

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Erreur lors de la recuperation");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Erreur fetch users:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/dashboard/parametres?tab=${tabId}`);
  };

  const handleSaveGeneral = async () => {
    alert("Parametres generaux enregistres !");
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: 0, color: "#111827" }}>Parametres</h1>
        <p style={{ margin: "4px 0 0 0", color: "#6b7280", fontSize: "14px" }}>Configuration du portail SPI-CAM</p>
      </div>

      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid #e5e7eb" }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                border: "none",
                borderBottom: isActive ? "2px solid #059669" : "2px solid transparent",
                background: "transparent",
                color: isActive ? "#059669" : "#6b7280",
                fontSize: "14px",
                fontWeight: isActive ? "600" : "500",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === "general" && (
          <div style={{ maxWidth: "800px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 20px 0" }}>Parametres generaux</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Nom du portail</label>
                <input
                  type="text"
                  value={generalSettings.nomPortail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, nomPortail: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Email de contact</label>
                <input
                  type="email"
                  value={generalSettings.emailContact}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, emailContact: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Langue par defaut</label>
                <select
                  value={generalSettings.langue}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, langue: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                >
                  <option value="fr">Francais</option>
                  <option value="en">Anglais</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Fuseau horaire</label>
                <select
                  value={generalSettings.fuseauHoraire}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, fuseauHoraire: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                >
                  <option value="Africa/Douala">Africa/Douala (WAT)</option>
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: "24px" }}>
              <button
                onClick={handleSaveGeneral}
                style={{ padding: "10px 20px", border: "none", borderRadius: "6px", background: "#2563eb", color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <>
            {loadingUsers ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTop: "4px solid #059669", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
                <p style={{ marginTop: "16px", color: "#6b7280" }}>Chargement des utilisateurs...</p>
              </div>
            ) : (
              <UsersContent users={users} />
            )}
          </>
        )}

        {activeTab === "notifications" && <NotificationsContent />}

        {activeTab === "security" && <SecurityContent />}

        {activeTab === "data" && <DataContent />}
      </div>
    </div>
  );
}

export default function ParametresPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTop: "4px solid #059669", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: "16px", color: "#6b7280" }}>Chargement...</p>
      </div>
    }>
      <ParametresContent />
    </Suspense>
  );
}
