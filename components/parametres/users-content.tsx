"use client";

import { useState } from "react";
import { Users, Shield, UserCheck, Search, Plus, Pencil, Trash2, X, Save } from "lucide-react";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  emailVerified: Date | null;
}

interface UsersContentProps {
  users: User[];
}

export default function UsersContent({ users: initialUsers }: UsersContentProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "AGENT_SAISIE",
    isActive: true,
  });

  const roleLabels: Record<string, string> = {
    AGENT_SAISIE: "Agent de saisie",
    ADMIN: "Administrateur",
    SUPER_ADMIN: "Super Administrateur",
  };

  const roleColors: Record<string, string> = {
    AGENT_SAISIE: "bg-blue-100 text-blue-800",
    ADMIN: "bg-green-100 text-green-800",
    SUPER_ADMIN: "bg-purple-100 text-purple-800",
  };

  const filteredUsers = users.filter((user) =>
    searchTerm
      ? (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      : true
  );

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "AGENT_SAISIE", isActive: true });
    setShowModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || "",
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      // Modifier
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? { ...u, name: formData.name, email: formData.email, role: formData.role, isActive: formData.isActive }
            : u
        )
      );
      // TODO: Appel API pour modifier
      // await fetch(`/api/admin/users/${editingUser.id}`, { method: "PUT", body: JSON.stringify(formData) });
    } else {
      // Ajouter
      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        createdAt: new Date(),
        emailVerified: null,
      };
      setUsers((prev) => [...prev, newUser]);
      // TODO: Appel API pour créer
      // await fetch("/api/admin/users", { method: "POST", body: JSON.stringify(formData) });
    }
    setShowModal(false);
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      // TODO: Appel API pour supprimer
      // await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    }
  };

  return (
    <div>
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-slate-500">Agents de saisie</p>
              <p className="text-xl font-bold text-slate-900">
                {users.filter((u) => u.role === "AGENT_SAISIE").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-slate-500">Administrateurs</p>
              <p className="text-xl font-bold text-slate-900">
                {users.filter((u) => u.role === "ADMIN").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-slate-500">Super Admins</p>
              <p className="text-xl font-bold text-slate-900">
                {users.filter((u) => u.role === "SUPER_ADMIN").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton ajouter + Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Ajouter un utilisateur
        </button>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Utilisateur</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Inscription</th>
                <th className="px-4 py-3">Email vérifié</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{user.name || "—"}</div>
                    <div className="text-slate-500 text-xs">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || "bg-gray-100 text-gray-800"}`}
                    >
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      {user.isActive ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    {user.emailVerified ? (
                      <span className="text-green-600 text-xs">✓ Oui</span>
                    ) : (
                      <span className="text-amber-600 text-xs">✗ Non</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Aucun utilisateur trouvé.
          </div>
        )}
      </div>

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="AGENT_SAISIE">Agent de saisie</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="SUPER_ADMIN">Super Administrateur</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Compte actif
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#007A3D] text-white rounded-lg hover:bg-[#006633] transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingUser ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
