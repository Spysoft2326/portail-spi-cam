"use client";

import { useState, FormEvent } from "react";

export default function ProductionPage() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div style={{ padding: "20px" }}>
        <button onClick={() => setShowForm(false)}>← Retour</button>
        <h1>Formulaire Production</h1>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); alert("Sauvegardé !"); setShowForm(false); }}>
          <div style={{ marginBottom: "10px" }}>
            <label>Entreprise</label>
            <select style={{ width: "100%", padding: "8px" }}>
              <option>Test Entreprise 1</option>
              <option>Test Entreprise 2</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Année</label>
            <select style={{ width: "100%", padding: "8px" }}>
              <option>2024</option>
              <option>2025</option>
              <option>2026</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Trimestre</label>
            <select style={{ width: "100%", padding: "8px" }}>
              <option>T1</option>
              <option>T2</option>
              <option>T3</option>
              <option>T4</option>
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
      <h1>Production</h1>
      <p>Gestion des saisies trimestrielles</p>
      <button 
        onClick={() => setShowForm(true)}
        style={{ padding: "10px 20px", background: "#059669", color: "white", border: "none", borderRadius: "4px", marginTop: "20px" }}
      >
        + Nouvelle saisie
      </button>

      <div style={{ marginTop: "30px", border: "1px solid #ccc", padding: "20px", borderRadius: "8px" }}>
        <h2>Historique</h2>
        <p>Aucune production enregistrée.</p>
      </div>
    </div>
  );
}
