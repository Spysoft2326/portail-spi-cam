// Référentiels partagés (pages et API). Aucun import serveur : utilisable côté client.

/** Minuscules, sans accents ni espaces superflus : sert à comparer "BTP / Matériaux" et "BTP / MATERIAUX". */
export function normaliser(s: string | null | undefined): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export const SECTEURS = [
  "Agriculture / Agro-industrie",
  "BTP / Matériaux",
  "Chimie / Plastique",
  "Commerce",
  "Énergie",
  "Environnement / Déchets",
  "Finance",
  "Forêt / Bois",
  "Industrie légère",
  "Métallurgie",
  "Pharmaceutique",
  "Santé",
  "Sécurité / Défense",
  "Télécommunications / IT",
  "Textile / Habillement",
  "Transport / Logistique",
  "Tourisme / Hôtellerie",
];

export const REGIONS = [
  "Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral",
  "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest",
];

export const UNITES = ["t", "kg", "hl", "L", "m3", "m2", "m", "unités", "cartons", "kWh", "MWh", "barils"];

/**
 * Renvoie la valeur du référentiel correspondant à `valeur` (comparaison sans casse ni accents),
 * ou la valeur d'origine si elle n'y figure pas — pour ne jamais écraser une donnée existante.
 */
export function valeurReferentiel(liste: string[], valeur: string | null | undefined): string {
  if (!valeur) return "";
  const cle = normaliser(valeur);
  return liste.find((v) => normaliser(v) === cle) ?? valeur;
}

/** Nettoie une liste de produits envoyée par un formulaire : [{ nom, unite }], sans doublons. */
export function nettoyerProduits(input: unknown): { nom: string; unite: string }[] {
  if (!Array.isArray(input)) return [];
  const vus = new Set<string>();
  const res: { nom: string; unite: string }[] = [];
  for (const p of input) {
    const nom = typeof p?.nom === "string" ? p.nom.trim().slice(0, 120) : "";
    const unite = typeof p?.unite === "string" && p.unite.trim() ? p.unite.trim().slice(0, 20) : "t";
    if (!nom || vus.has(normaliser(nom))) continue;
    vus.add(normaliser(nom));
    res.push({ nom, unite });
  }
  return res;
}
