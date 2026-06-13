"use client";

import { useState, FormEvent } from "react";

export default function EntreprisesPage() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div style={{ padding: "20px" }}>
        <button onClick={() => setShowForm(false)}>← Retour</button>
        <h1>Formulaire Entreprise</h1>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); alert("Sauvegardé !"); setShowForm(false); }}>
          <div style={{ marginBottom: "10px" }}>
            <label>Dénomination *</label>
            <input type="text" required placeholder="Nom de l'entreprise" style={{ width: "100%", padding: "8px" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Sigle</label>
            <input type="text" placeholder="Sigle" style={{ width: "100%", padding: "8px" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Secteur *</label>
            <select style={{ width: "100%", padding: "8px" }}>
              <option>Agriculture</option>
              <option>Industrie</option>
              <option>Services</option>
              <option>Commerce</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Ville</label>
            <input type="text" placeholder="Yaoundé, Douala..." style={{ width: "100%", padding: "8px" }} />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Région</label>
            <select style={{ width: "100%", padding: "8px" }}>
              <option>Centre</option>
              <option>Littoral</option>
              <option>Ouest</option>
            </select>
          </div>
          <button type="submit" style={{ padding: "10px 20px", background: "#059669", color: "white", border: "none", borderRadius: "4px" }}>
            Enregistrer
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Annuaire des Entreprises</h1>
      <p>Gestion des entreprises</p>
      <button 
        onClick={() => setShowForm(true)}
        style={{ padding: "10px 20px", background: "#059669", color: "white", border: "none", borderRadius: "4px", marginTop: "20px" }}
      >
        + Ajouter
      </button>

      <div style={{ marginTop: "30px", border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
        <h2>Liste des entreprises</h2>
        <p>Aucune entreprise enregistrée.</p>
      </div>
    </div>
  );
}
