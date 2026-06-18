"use client";

import { useState } from "react";
import { Shield, Lock, Clock, FileText, Key } from "lucide-react";

interface SecuritySettings {
  minPasswordLength: number;
  requireUppercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  sessionDuration: number; // en minutes
  maxLoginAttempts: number;
  twoFactorEnabled: boolean;
}

export default function SecurityContent() {
  const [settings, setSettings] = useState<SecuritySettings>({
    minPasswordLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    sessionDuration: 60,
    maxLoginAttempts: 5,
    twoFactorEnabled: false,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof SecuritySettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    console.log("Security settings saved:", settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const ToggleSwitch = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        border: "none",
        cursor: "pointer",
        background: active ? "#059669" : "#d1d5db",
        position: "relative",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          background: "white",
          position: "absolute",
          top: "2px",
          left: active ? "22px" : "2px",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );

  return (
    <div style={{ maxWidth: "800px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: "8px" }}>
        <Shield className="w-5 h-5" />
        Configuration de la securite
      </h3>

      {/* Politique de mots de passe */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock className="w-5 h-5" style={{ color: "#2563eb" }} />
          </div>
          <div>
            <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>Politique de mots de passe</p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>Exigences pour les mots de passe utilisateurs</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Longueur minimale</label>
            <input
              type="number"
              min={6}
              max={32}
              value={settings.minPasswordLength}
              onChange={(e) => handleChange("minPasswordLength", parseInt(e.target.value))}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>caracteres minimum</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "14px", margin: 0 }}>Exiger des majuscules</p>
            <ToggleSwitch active={settings.requireUppercase} onClick={() => handleChange("requireUppercase", !settings.requireUppercase)} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "14px", margin: 0 }}>Exiger des chiffres</p>
            <ToggleSwitch active={settings.requireNumbers} onClick={() => handleChange("requireNumbers", !settings.requireNumbers)} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: "14px", margin: 0 }}>Exiger des caracteres speciaux</p>
            <ToggleSwitch active={settings.requireSpecialChars} onClick={() => handleChange("requireSpecialChars", !settings.requireSpecialChars)} />
          </div>
        </div>
      </div>

      {/* Session */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Clock className="w-5 h-5" style={{ color: "#d97706" }} />
          </div>
          <div>
            <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>Gestion des sessions</p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>Parametres de connexion et de session</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Duree de session (minutes)</label>
            <input
              type="number"
              min={15}
              max={480}
              value={settings.sessionDuration}
              onChange={(e) => handleChange("sessionDuration", parseInt(e.target.value))}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>Deconnexion automatique apres inactivite</p>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Tentatives de connexion max</label>
            <input
              type="number"
              min={3}
              max={10}
              value={settings.maxLoginAttempts}
              onChange={(e) => handleChange("maxLoginAttempts", parseInt(e.target.value))}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
            />
            <p style={{ fontSize: "12px", color: "#6b7280", margin: "4px 0 0 0" }}>Bloquage temporaire apres echecs</p>
          </div>
        </div>
      </div>

      {/* 2FA */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Key className="w-5 h-5" style={{ color: "#059669" }} />
            </div>
            <div>
              <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>Authentification a deux facteurs (2FA)</p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>Activer la double authentification pour les admins</p>
            </div>
          </div>
          <ToggleSwitch active={settings.twoFactorEnabled} onClick={() => handleChange("twoFactorEnabled", !settings.twoFactorEnabled)} />
        </div>
        {settings.twoFactorEnabled && (
          <div style={{ marginTop: "16px", padding: "12px", borderRadius: "6px", background: "#fef3c7", fontSize: "13px", color: "#92400e" }}>
            ⚠️ La configuration 2FA sera disponible dans une prochaine mise a jour.
          </div>
        )}
      </div>

      {/* Audit log */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText className="w-5 h-5" style={{ color: "#db2777" }} />
          </div>
          <div>
            <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>Journal d'audit</p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>Historique des connexions et actions</p>
          </div>
        </div>
        <button
          onClick={() => alert("Journal d'audit - Fonctionnalite en cours de developpement")}
          style={{ padding: "8px 16px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", color: "#374151" }}
        >
          📋 Voir le journal
        </button>
      </div>

      {/* Bouton Enregistrer */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "24px" }}>
        <button
          onClick={handleSave}
          style={{ padding: "10px 24px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          💾 Enregistrer
        </button>
        {saved && (
          <span style={{ color: "#059669", fontSize: "14px", fontWeight: "500" }}>✅ Parametres enregistres !</span>
        )}
      </div>
    </div>
  );
}
