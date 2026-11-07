"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, User, Mail, Shield, Save, AlertTriangle } from "lucide-react";
import { verifierMotDePasse } from "@/lib/rbac";

export default function MonCompteContent() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("❌ Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    // Même politique que le serveur (lib/rbac.ts)
    const probleme = verifierMotDePasse(passwordData.newPassword);
    if (probleme) {
      setMessage("❌ " + probleme + ".");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Mot de passe modifié avec succès !");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        // Rafraîchit la session (le changement obligatoire est levé), puis retour à l'espace de travail
        const etaitImpose = !!(user as any)?.doitChangerMotDePasse;
        await update();
        if (etaitImpose) {
          const r = user?.role;
          window.location.href = r === "SUPER_ADMIN" ? "/dashboard/super-admin" : r === "ADMIN" ? "/dashboard/admin" : "/dashboard/agent-saisie";
          return;
        }
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ " + (data.error || "Erreur lors de la modification."));
      }
    } catch (error) {
      setMessage("❌ Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return "Super Admin";
      case "ADMIN": return "Administrateur";
      case "AGENT_SAISIE": return "Agent de saisie";
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN": return { bg: "#dbeafe", color: "#1d4ed8" };
      case "ADMIN": return { bg: "#d1fae5", color: "#059669" };
      case "AGENT_SAISIE": return { bg: "#fef3c7", color: "#d97706" };
      default: return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  const roleStyle = getRoleColor(user?.role || "");

  return (
    <div>
      {(user as any)?.doitChangerMotDePasse && (
        <div role="alert" style={{ padding: "16px 20px", borderRadius: "12px", border: "1px solid #fbbf24", background: "#fef3c7", color: "#92400e", marginBottom: "24px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <AlertTriangle size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong>Changement de mot de passe obligatoire</strong>
            <p style={{ margin: "4px 0 0", fontSize: "14px" }}>
              Votre compte utilise le mot de passe par défaut. Choisissez un mot de passe personnel pour accéder au portail.
            </p>
          </div>
        </div>
      )}

      {/* Informations du profil */}
      <div style={{ padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <User size={20} />
          Informations du profil
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
              <Mail size={14} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
              Nom
            </label>
            <input
              type="text"
              value={user?.name || ""}
              disabled
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "#f9fafb", color: "#6b7280" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
              <Mail size={14} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "#f9fafb", color: "#6b7280" }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>
              <Shield size={14} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
              Rôle
            </label>
            <div style={{ padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "#f9fafb" }}>
              <span style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "500", background: roleStyle.bg, color: roleStyle.color }}>
                {getRoleLabel(user?.role || "")}
              </span>
            </div>
          </div>
        </div>
        <p style={{ marginTop: "16px", fontSize: "13px", color: "#6b7280" }}>
          ℹ️ Ces informations sont gérées par l'administration du portail. Contactez un administrateur pour les modifier.
        </p>
      </div>

      {/* Changement de mot de passe */}
      <div style={{ padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 20px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <Shield size={20} />
          Changer mon mot de passe
        </h3>

        {message && (
          <div style={{ padding: "12px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", background: message.startsWith("✅") ? "#d1fae5" : "#fee2e2", color: message.startsWith("✅") ? "#059669" : "#dc2626" }}>
            {message}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            {/* Mot de passe actuel */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Mot de passe actuel</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Votre mot de passe actuel"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  style={{ width: "100%", padding: "10px 44px 10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: "#6b7280" }}
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Nouveau mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNewPassword ? "text" : "password"}
                  placeholder="10 caractères minimum"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  style={{ width: "100%", padding: "10px 44px 10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                  required
                  minLength={10}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: "#6b7280" }}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirmer le nouveau mot de passe */}
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Confirmer le nouveau mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Répétez le nouveau mot de passe"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  style={{ width: "100%", padding: "10px 44px 10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                  required
                  minLength={10}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: "#6b7280" }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <p style={{ margin: "0 0 16px", fontSize: "13px", color: "#6b7280" }}>
            Au moins 10 caractères, avec des majuscules, des minuscules, un chiffre et un caractère spécial.
          </p>
          <button
            type="submit"
            disabled={loading}
            style={{ padding: "10px 24px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", opacity: loading ? 0.5 : 1 }}
          >
            <Save size={16} />
            {loading ? "Enregistrement..." : "Changer le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
