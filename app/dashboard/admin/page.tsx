"use client";

import SuperAdminContent from "@/components/dashboard/super-admin-content";

// Tableau de bord des administrateurs : même contenu que celui du super admin
// (statistiques accessibles à partir du rôle ADMIN). Auparavant, cette page redirigeait vers
// /dashboard/super-admin, interdit aux admins, ce qui provoquait une boucle de redirection.
export default function DashboardAdminPage() {
  return <SuperAdminContent />;
}
