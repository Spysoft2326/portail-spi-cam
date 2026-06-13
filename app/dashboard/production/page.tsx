"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProductionPage() {
  const { status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [productions, setProductions] = useState([]);
  const [enterprises, setEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    entrepriseId: "",
    annee: "2026",
    trimestre: "T1",
    productionPhysique: "",
    chiffreAffaires: "",
    nombreEmployes: "",
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
      const [entRes, prodRes] = await Promise.all([
        fetch("/api/entreprises"),
        fetch("/api/productions")
      ]);

      if (entRes.ok) {
        const entData = await entRes.json();
        setEnterprises(entData.enterprises || entData || []);
      }

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProductions(prodData.productions || prodData || []);
      }
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.entrepriseId) {
      alert("Veuillez sélectionner une entreprise");
      return;
    }

    try {
      const res = await fetch("/api/productions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entrepriseId: formData.entrepriseId,
          annee: parseInt(formData.annee),
          trimestre: formData.trimestre,
          productionPhysique: parseFloat(formData.productionPhysique) || 0,
          chiffreAffaires: parseFloat(formData.chiffreAffaires) || 0,
          nombreEmployes: parseInt(formData.nombreEmployes) || 0,
        }),
      });

      if (res.ok) {
        alert("Production enregistrée !");
        setShowForm(false);
        setFormData({
          entrepriseId: "", annee: "2026", trimestre: "T1",
          productionPhysique: "", chiffreAffaires: "", nombreEmployes: "",
        });
        fetchData();
      } else {
        alert("Erreur lors de l'enregistrement");
      }
    } catch (error) {
      alert("Erreur de connexion");
    }
  };

  const getEnterpriseName = (id) => {
    const ent = enterprises.find((e) => e.id === id);
    return ent ? ent.nom : "Entreprise inconnue";
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
          ← Retour aux productions
        </button>

        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
          Nouvelle saisie
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
              Entreprise
            </h2>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Sélectionner une entreprise *
            </label>
            <select
              value={formData.entrepriseId}
              onChange={(e) => setFormData({ ...formData, entrepriseId: e.target.value })}
              style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
            >
              <option value="">Choisir une entreprise...</option>
              {enterprises.map((ent) => (
                <option key={ent.id} value={ent.id}>{ent.nom}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
              Période
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Année *</label>
                <select
                  value={formData.annee}
                  onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Trimestre *</label>
                <select
                  value={formData.trimestre}
                  onChange={(e) => setFormData({ ...formData, trimestre: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                >
                  <option value="T1">T1 (Janvier - Mars)</option>
                  <option value="T2">T2 (Avril - Juin)</option>
                  <option value="T3">T3 (Juillet - Septembre)</option>
                  <option value="T4">T4 (Octobre - Décembre)</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}>
              Données de production
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Production physique</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.productionPhysique}
                  onChange={(e) => setFormData({ ...formData, productionPhysique: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Chiffre d'affaires (FCFA)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.chiffreAffaires}
                  onChange={(e) => setFormData({ ...formData, chiffreAffaires: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "5px" }}>Nombre d'employés</label>
                <input
                  type="number"
                  placeholder="0"
                  value={formData.nombreEmployes}
                  onChange={(e) => setFormData({ ...formData, nombreEmployes: e.target.value })}
                  style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
              </div>
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
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Production</h1>
          <p style={{ color: "#666" }}>Gestion des saisies trimestrielles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ padding: "10px 20px", border: "none", borderRadius: "4px", background: "#059669", color: "white", cursor: "pointer" }}
        >
          + Nouvelle saisie
        </button>
      </div>

      <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "20px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>
          Historique des saisies ({productions.length})
        </h2>

        {productions.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", padding: "40px" }}>
            Aucune production enregistrée. Cliquez sur "Nouvelle saisie" pour commencer.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {productions.map((p) => (
              <div
                key={p.id}
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
                  <p style={{ fontWeight: "bold" }}>{getEnterpriseName(p.entrepriseId)}</p>
                  <p style={{ fontSize: "14px", color: "#666" }}>
                    {p.annee} - {p.trimestre} | {p.productionPhysique} unités | {p.chiffreAffaires} FCFA
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
