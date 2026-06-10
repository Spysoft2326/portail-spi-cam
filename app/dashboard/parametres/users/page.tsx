"use client";

import { useEffect, useState } from "react";
import UsersContent from "@/components/parametres/users-content";

interface ApiUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  emailVerified?: string | null;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  emailVerified: Date | null;
}

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => {
        if (!res.ok) {
          console.error("API Error:", res.status, res.statusText);
          return { users: [] };
        }
        return res.json();
      })
      .then((data) => {
        const apiUsers: ApiUser[] = data.users || [];
        const convertedUsers: User[] = apiUsers.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: true, // Par défaut actif si non fourni par l'API
          createdAt: new Date(user.createdAt),
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        }));
        console.log("Users loaded:", convertedUsers.length);
        setUsers(convertedUsers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <UsersContent users={users} />;
}
