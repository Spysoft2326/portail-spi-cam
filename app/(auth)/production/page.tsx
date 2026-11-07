import { redirect } from "next/navigation";

// Ancienne page (saisie mono-produit) : remplacée par les déclarations multi-produits
export default function Page() {
  redirect("/dashboard/production");
}
