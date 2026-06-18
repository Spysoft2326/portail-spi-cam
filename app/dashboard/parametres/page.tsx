"use client";

import { useState, useEffect } from "react";
import UsersContent from "@/components/parametres/users-content";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  emailVerified: Date | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/users");
        if (!res.ok) {
          throw new Error("Erreur lors de la recuperation des utilisateurs");
        }
        const data = await res.json();
        console.log("Users fetched from API:", data.length, data);
        setUsers(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Erreur fetch users:", err);
        setError(err.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #e5e7eb", borderTop: "4px solid #059669", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ marginTop: "16px", color: "#6b7280" }}>Chargement des utilisateurs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "#dc2626" }}>Erreur : {error}</p>
      </div>
    );
  }

  return <UsersContent users={users} />;
}
