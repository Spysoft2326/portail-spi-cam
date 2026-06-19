"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  emailVerified: Date | null;
}

interface UsersContentProps {
  users: User[];
}

export default function UsersContent({ users }: UsersContentProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", role: "AGENT_SAISIE", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Compteurs par role
  const agentsCount = users.filter((u) => u.role === "AGENT_SAISIE").length;
  const adminsCount = users.filter((u) => u.role === "ADMIN").length;
  const superAdminsCount = users.filter((u) => u.role === "SUPER_ADMIN").length;

  // Filtrage
  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      !search ||
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.email && u.email.toLowerCase().includes(search)) ||
      u.role.toLowerCase().includes(search)
    );
  });

  const resetForm = () => {
    setFormData({ name: "", email: "", role: "AGENT_SAISIE", password: "" });
    setEditingUser(null);
    setShowForm(false);
    setShowPassword(false);
  };

  const handleEdit = (user: User) => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      password: "",
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingUser) {
        // Modification
        const res = await fetch(`/api/admin/users`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingUser.id, role: formData.role }),
        });
        if (res.ok) {
          alert("Utilisateur modifie !");
          resetForm();
          router.refresh();
        } else {
          const err = await res.json().catch(() => ({}));
          alert("Erreur : " + (err.error || "Erreur lors de la modification"));
        }
      } else {
        // Ajout
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          alert("Utilisateur ajoute !");
          resetForm();
          router.refresh();
        } else {
          const err = await res.json().catch(() => ({}));
          alert("Erreur : " + (err.error || "Erreur lors de l'ajout"));
        }
      }
    } catch (error) {
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Utilisateur supprime");
        router.refresh();
      } else {
        const err = await res.json().catch(() => ({}));
        alert("Erreur : " + (err.error || "Erreur lors de la suppression"));
      }
    } catch (error) {
      alert("Erreur de connexion");
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

  return (
    <div>
      {/* Compteurs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👤</div>
          <div>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Agents de saisie</p>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", margin: "4px 0 0 0" }}>{agentsCount}</p>
          </div>
        </div>
        <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🛡️</div>
          <div>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Administrateurs</p>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", margin: "4px 0 0 0" }}>{adminsCount}</p>
          </div>
        </div>
        <div style={{ padding: "20px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#fce7f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>👑</div>
          <div>
            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Super Admins</p>
            <p style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", margin: "4px 0 0 0" }}>{superAdminsCount}</p>
          </div>
        </div>
      </div>

      {/* Recherche + Ajouter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>🔍</span>
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "10px 12px 10px 40px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px" }}
          />
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: "10px 20px", border: "none", borderRadius: "8px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}
        >
          ➕ Ajouter un utilisateur
        </button>
      </div>

      {/* Formulaire Ajout/Modification */}
      {showForm && (
        <div style={{ padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", margin: "0 0 20px 0" }}>
            {editingUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Nom</label>
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Email</label>
                <input
                  type="email"
                  placeholder="email@exemple.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px", background: "white" }}
                >
                  <option value="AGENT_SAISIE">Agent de saisie</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              {!editingUser && (
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>Mot de passe</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ width: "100%", padding: "10px 44px 10px 12px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "14px" }}
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px",
                        color: "#6b7280",
                      }}
                      title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={resetForm}
                style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px" }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{ padding: "10px 20px", border: "none", borderRadius: "6px", background: "#059669", color: "white", cursor: "pointer", fontSize: "14px", opacity: loading ? 0.5 : 1 }}
              >
                {loading ? "Enregistrement..." : (editingUser ? "Modifier" : "Ajouter")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div style={{ borderRadius: "12px", border: "1px solid #e5e7eb", background: "white", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: "600", fontSize: "16px" }}>👥 Utilisateurs ({filteredUsers.length})</div>
        </div>
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>👤</div>
            <h3 style={{ fontSize: "16px", fontWeight: "600", margin: "0 0 8px 0" }}>Aucun utilisateur trouve</h3>
            <p style={{ color: "#6b7280", margin: 0 }}>Ajoutez un utilisateur pour commencer.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb" }}>Utilisateur</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb" }}>Role</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb" }}>Inscription</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb" }}>Email verifie</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #e5e7eb" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const roleStyle = getRoleColor(user.role);
                  return (
                    <tr key={user.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "16px" }}>
                        <p style={{ fontWeight: "600", margin: 0, color: "#111827", fontSize: "14px" }}>{user.name || "-"}</p>
                        <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0 0 0" }}>{user.email || "-"}</p>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "500", background: roleStyle.bg, color: roleStyle.color }}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td style={{ padding: "16px", fontSize: "14px", color: "#374151" }}>
                        {user.emailVerified ? new Date(user.emailVerified).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td style={{ padding: "16px" }}>
                        <span style={{ fontSize: "14px" }}>
                          {user.emailVerified ? "✅" : "❌"}
                        </span>
                      </td>
                      <td style={{ padding: "16px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => handleEdit(user)}
                            title="Modifier"
                            style={{ padding: "6px", border: "1px solid #d1d5db", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px" }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            title="Supprimer"
                            style={{ padding: "6px", border: "1px solid #ef4444", borderRadius: "6px", background: "white", cursor: "pointer", fontSize: "14px", color: "#ef4444" }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
