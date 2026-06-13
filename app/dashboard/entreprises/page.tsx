"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function EntreprisesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nom: "",
    sigle: "",
    description: "",
    secteurActivite: "AUTRE",
    ville: "",
    region: "",
    adresse: "",
    telephone: "",
    email: "",
    nomContact: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/entreprises");
      if (res.ok) {
        const data = await res.json();
        setEnterprises(data.enterprises || data || []);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) {
      alert("Le nom est obligatoire");
      return;
    }

    try {
      const res = await fetch("/api/entreprises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Entreprise ajoutée !");
        setShowForm(false);
        setFormData({
          nom: "", sigle: "", description: "", secteurActivite: "AUTRE",
          ville: "", region: "", adresse: "", telephone: "", email: "", nomContact: "",
        });
        fetchData();
      } else {
        alert("Erreur lors de l'ajout");
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  const getSecteurLabel = (secteur) => {
    const labels = {
      AGRICULTURE: "Agriculture", INDUSTRIE: "Industrie", SERVICES: "Services",
      COMMERCE: "Commerce", CONSTRUCTION: "Construction", TECHNOLOGIE: "Technologie",
      TRANSPORT: "Transport", TOURISME: "Tourisme", SANTE: "Santé",
      EDUCATION: "Éducation", FINANCE: "Finance", AUTRE: "Autre",
    };
    return labels[secteur] || secteur;
  };

  if (status === "loading" || loading) {
    return (
      <div style={{ padding: "20px" }}>
        <p>Chargement...</p>
      </div>
    );
  }

  // Formulaire
  if (showForm) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px" }}>
        <button onClick={() => setShowForm(false)} style={{ marginBottom: "20px" }}>
          ← Retour à l'annuaire
        </button>

        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
          Ajouter une entreprise
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
              Identité
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Dénomination *</label>
                <input
                  type="text"
                  placeholder="Nom de l'entreprise"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Sigle</label>
                <input
                  type="text"
                  placeholder="Sigle"
                  value={formData.sigle}
                  onChange={(e) => setFormData({ ...formData, sigle: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Description</label>
              <input
                type="text"
                placeholder="Description de l'activité..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Secteur d'activité *</label>
              <select
                value={formData.secteurActivite}
                onChange={(e) => setFormData({ ...formData, secteurActivite: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
              >
                <option value="AGRICULTURE">Agriculture</option>
                <option value="INDUSTRIE">Industrie</option>
                <option value="SERVICES">Services</option>
                <option value="COMMERCE">Commerce</option>
                <option value="CONSTRUCTION">Construction</option>
                <option value="TECHNOLOGIE">Technologie</option>
                <option value="TRANSPORT">Transport</option>
                <option value="TOURISME">Tourisme</option>
                <option value="SANTE">Santé</option>
                <option value="EDUCATION">Éducation</option>
                <option value="FINANCE">Finance</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
              Localisation
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Ville</label>
                <input
                  type="text"
                  placeholder="Ex: Yaoundé, Douala..."
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Région</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                >
                  <option value="">Non spécifiée</option>
                  <option value="Adamaoua">Adamaoua</option>
                  <option value="Centre">Centre</option>
                  <option value="Est">Est</option>
                  <option value="Extrême-Nord">Extrême-Nord</option>
                  <option value="Littoral">Littoral</option>
                  <option value="Nord">Nord</option>
                  <option value="Nord-Ouest">Nord-Ouest</option>
                  <option value="Ouest">Ouest</option>
                  <option value="Sud">Sud</option>
                  <option value="Sud-Ouest">Sud-Ouest</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Adresse postale / BP</label>
              <input
                type="text"
                placeholder="Ex: BP 1234 Yaoundé..."
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
              Contact
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Nom du contact</label>
                <input
                  type="text"
                  placeholder="Ex: Jean Dupont..."
                  value={formData.nomContact}
                  onChange={(e) => setFormData({ ...formData, nomContact: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Téléphone</label>
                <input
                  type="text"
                  placeholder="Ex: +237 6XX XXX XXX"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "5px" }}>Email</label>
              <input
                type="email"
                placeholder="Ex: contact@entreprise.cm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{ padding: "10px 20px", border: "1px solid #ccc", borderRadius: "4px", background: "white", cursor: "pointer" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{ padding: "10px 20px", border: "none", borderRadius: "4px", background: "#059669", color: "white", cursor: "pointer" }}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Liste
  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Annuaire des Entreprises</h1>
          <p style={{ color: "#666" }}>{enterprises.length} entreprises répertoriées</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: "10px 20px", border: "none", borderRadius: "4px", background: "#059669", color: "white", cursor: "pointer" }}
        >
          + Ajouter
        </button>
      </div>

      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>
          Résultats ({enterprises.length})
        </h2>

        {enterprises.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>
            Aucune entreprise enregistrée. Cliquez sur "Ajouter" pour commencer.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {enterprises.map((e) => (
              <div
                key={e.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "15px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              >
                <div>
                  <p style={{ fontWeight: "bold" }}>{e.nom}</p>
                  {e.sigle && <p style={{ fontSize: "14px", color: "#666" }}>{e.sigle}</p>}
                  <p style={{ fontSize: "14px", color: "#666" }}>
                    {getSecteurLabel(e.secteurActivite)}
                    {e.ville && ` | ${e.ville}`}
                    {e.region && `, ${e.region}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
