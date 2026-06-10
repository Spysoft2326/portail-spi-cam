"use client";

import { useEffect, useState } from "react";
import UsersContent from "@/components/parametres/users-content";

interface ApiUser {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  emailVerified: string | null;
}

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        const apiUsers: ApiUser[] = data.users || [];
        // Convertir les dates string en Date
        const convertedUsers = apiUsers.map((user) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
        }));
        setUsers(convertedUsers);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
