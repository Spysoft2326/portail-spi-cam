"use client";

import { useState } from "react";
import { Bell, Mail, Calendar, Building2, BarChart3 } from "lucide-react";

interface NotificationSettings {
  emailEnabled: boolean;
  newEnterprise: boolean;
  productionToValidate: boolean;
  reportFrequency: "daily" | "weekly" | "monthly";
  emailRecipients: string;
}

export default function NotificationsContent() {
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    newEnterprise: true,
    productionToValidate: true,
    reportFrequency: "weekly",
    emailRecipients: "contact@spi-cam.cm",
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    // TODO: Sauvegarder via API
    console.log("Settings saved:", settings);
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
        <Bell className="w-5 h-5" />
        Configuration des notifications
      </h3>

      {/* Email global */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mail className="w-5 h-5" style={{ color: "#2563eb" }} />
            </div>
            <div>
              <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>Notifications par email</p>
              <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>Activer l'envoi des notifications par email</p>
            </div>
          </div>
          <ToggleSwitch active={settings.emailEnabled} onClick={() => handleToggle("emailEnabled")} />
        </div>
      </div>

      {/* Destinataires */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>Email destinataire</label>
        <input
          type="email"
          value={settings.emailRecipients}
          onChange={(e) => { setSettings({ ...settings, emailRecipients: e.target.value }); setSaved(false); }}
          style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
          placeholder="email@exemple.com"
        />
        <p style={{ fontSize: "12px", color: "#6b7280", margin: "6px 0 0 0" }}>Séparés par des virgules pour plusieurs destinataires</p>
      </div>

      {/* Événements */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <p style={{ fontWeight: "600", margin: "0 0 16px 0", fontSize: "14px" }}>Événements à notifier</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 className="w-4 h-4" style={{ color: "#059669" }} />
              </div>
              <div>
                <p style={{ fontWeight: "500", margin: 0, fontSize: "14px" }}>Nouvelle entreprise</p>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}>Alerte lorsqu'une entreprise est ajoutée</p>
              </div>
            </div>
            <ToggleSwitch active={settings.newEnterprise} onClick={() => handleToggle("newEnterprise")} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BarChart3 className="w-4 h-4" style={{ color: "#d97706" }} />
              </div>
              <div>
                <p style={{ fontWeight: "500", margin: 0, fontSize: "14px" }}>Production à valider</p>
                <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}>Alerte lorsqu'une production est en attente</p>
              </div>
            </div>
            <ToggleSwitch active={settings.productionToValidate} onClick={() => handleToggle("productionToValidate")} />
          </div>
        </div>
      </div>

      {/* Fréquence des rapports */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar className="w-5 h-5" style={{ color: "#db2777" }} />
          </div>
          <div>
            <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>Fréquence des rapports</p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>Fréquence d'envoi des rapports récapitulatifs</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {(["daily", "weekly", "monthly"] as const).map((freq) => (
            <button
              key={freq}
              onClick={() => { setSettings({ ...settings, reportFrequency: freq }); setSaved(false); }}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: settings.reportFrequency === freq ? "1px solid #059669" : "1px solid #d1d5db",
                background: settings.reportFrequency === freq ? "#ecfdf5" : "white",
                color: settings.reportFrequency === freq ? "#059669" : "#374151",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: settings.reportFrequency === freq ? "600" : "400",
              }}
            >
              {freq === "daily" ? "Quotidien" : freq === "weekly" ? "Hebdomadaire" : "Mensuel"}
            </button>
          ))}
        </div>
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
          <span style={{ color: "#059669", fontSize: "14px", fontWeight: "500" }}>✅ Paramètres enregistrés !</span>
        )}
      </div>
    </div>
  );
}
