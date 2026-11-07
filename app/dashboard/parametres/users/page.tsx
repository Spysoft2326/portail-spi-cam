import UsersContent from "@/components/parametres/users-content";

// Gestion des comptes : les données sont chargées via l'API protégée /api/admin/users
// (droits selon lib/rbac.ts ; l'accès à la page est réservé aux administrateurs par le middleware).
export default function UsersPage() {
  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", margin: "0 0 20px" }}>Utilisateurs</h1>
      <UsersContent />
    </div>
  );
}
