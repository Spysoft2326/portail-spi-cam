"use client";

import { useState } from "react";
import { Database, Download, Upload, Trash2, Save, RefreshCw } from "lucide-react";

export default function DataContent() {
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [exportEntity, setExportEntity] = useState<"all" | "entreprises" | "users" | "productions">("all");
  const [saved, setSaved] = useState(false);
  const [purging, setPurging] = useState(false);

  const handleExport = () => {
    alert(`Export ${exportFormat.toUpperCase()} des ${exportEntity} lance !`);
  };

  const handleImport = () => {
    alert("Import de donnees - Fonctionnalite en cours de developpement");
  };

  const handleBackup = () => {
    alert("Sauvegarde de la base de donnees lancee !");
  };

  const handleRestore = () => {
    alert("Restauration - Fonctionnalite en cours de developpement");
  };

  const handlePurge = () => {
    if (confirm("⚠️ Cette action supprimera definitivement les anciennes donnees. Continuer ?")) {
      setPurging(true);
      setTimeout(() => {
        setPurging(false);
        alert("Purge terminee !");
      }, 2000);
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: "8px" }}>
        <Database className="w-5 h-5" />
        Gestion des donnees
      </h3>

      {/* Export */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Download className="w-5 h-5" style={{ color: "#2563eb" }} />
          </div>
          <div>
            <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>Exporter les donnees</p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>Telecharger les donnees du portail</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Format</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["csv", "json"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: exportFormat === fmt ? "1px solid #2563eb" : "1px solid #d1d5db",
                    background: exportFormat === fmt ? "#eff6ff" : "white",
                    color: exportFormat === fmt ? "#2563eb" : "#374151",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: exportFormat === fmt ? "600" : "400",
                  }}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Donnees</label>
            <select
              value={exportEntity}
              onChange={(e) => setExportEntity(e.target.value as any)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
            >
              <option value="all">Toutes les donnees</option>
              <option value="entreprises">Entreprises uniquement</option>
              <option value="users">Utilisateurs uniquement</option>
              <option value="productions">Productions uniquement</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleExport}
          style={{ padding: "10px 20px", border: "none", borderRadius: "6px", background: "#2563eb", color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Download className="w-4 h-4" />
          Exporter
        </button>
      </div>

      {/* Import */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Upload className="w-5 h-5" style={{ color: "#059669" }} />
          </div>
          <div>
            <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>Importer des donnees</p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>Charger des donnees depuis un fichier</p>
          </div>
        </div>
        <button
          onClick={handleImport}
          style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", color: "#374151" }}
        >
          <Upload className="w-4 h-4" />
          Importer
        </button>
      </div>

      {/* Sauvegarde / Restauration */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Save className="w-5 h-5" style={{ color: "#d97706" }} />
          </div>
          <div>
            <p style={{ fontWeight: "600", margin: 0, fontSize: "14px" }}>Sauvegarde et restauration</p>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>Gerer les sauvegardes de la base de donnees</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleBackup}
            style={{ padding: "10px 20px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
          <button
            onClick={handleRestore}
            style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", color: "#374151" }}
          >
            <RefreshCw className="w-4 h-4" />
            Restaurer
          </button>
        </div>
      </div>

      {/* Purge */}
      <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #fee2e2", background: "#fef2f2", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trash2 className="w-5 h-5" style={{ color: "#dc2626" }} />
          </div>
          <div>
            <p style={{ fontWeight: "600", margin: 0, fontSize: "14px", color: "#dc2626" }}>Zone dangereuse</p>
            <p style={{ fontSize: "13px", color: "#991b1b", margin: "2px 0 0 0" }}>Suppression definitive des donnees</p>
          </div>
        </div>
        <button
          onClick={handlePurge}
          disabled={purging}
          style={{
            padding: "10px 20px",
            border: "1px solid #dc2626",
            borderRadius: "6px",
            background: "white",
            color: "#dc2626",
            cursor: "pointer",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: purging ? 0.5 : 1,
          }}
        >
          <Trash2 className="w-4 h-4" />
          {purging ? "Suppression en cours..." : "Purger les anciennes donnees"}
        </button>
      </div>
    </div>
  );
}
