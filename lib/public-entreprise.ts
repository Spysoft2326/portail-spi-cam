// Champs d'une fiche entreprise exposés publiquement (jamais l'agent, le motif de rejet, le NIU...).
export const SELECT_PUBLIC = {
  id: true, referenceSPI: true, denomination: true, sigle: true, ville: true, region: true,
  adresse: true, telephone: true, email: true, siteWeb: true, produitsPrincipaux: true,
  secteurActivite: true, activiteCode: true, filiereCode: true, champIndustriel: true, taille: true,
  activite: { select: { code: true, libelle: true, section: true } },
  filiere: { select: { code: true, libelle: true, prioritaire: true } },
} as const;
