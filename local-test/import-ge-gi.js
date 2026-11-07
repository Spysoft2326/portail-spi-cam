// Import LOCAL des grandes industries (feuille GE-GI du fichier MINMIDT), classées en brouillon CITI Rév.4.
// Source : local-test/data/ge-gi-classe.csv (produit par scripts/nomenclature/classer-ge-gi.py, non versionné).
// Crée une entreprise + son établissement principal par ligne. Base de test SQLite uniquement.
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const FICHIER = path.join(__dirname, "data", "ge-gi-classe.csv");

const REGION_DE_VILLE = {
  DOUALA: "Littoral", EDEA: "Littoral", NKONGSAMBA: "Littoral", LOUM: "Littoral", MBANGA: "Littoral", DIBOMBARI: "Littoral",
  YAOUNDE: "Centre", SOA: "Centre", MBALMAYO: "Centre", OBALA: "Centre", "NANGA EBOKO": "Centre",
  LIMBE: "Sud-Ouest", KUMBA: "Sud-Ouest", TIKO: "Sud-Ouest", BUEA: "Sud-Ouest", "EKONDO TITI": "Sud-Ouest", MUTENGENE: "Sud-Ouest",
  KRIBI: "Sud", EBOLOWA: "Sud", SANGMELIMA: "Sud",
  BAFOUSSAM: "Ouest", FOUMBOT: "Ouest", DSCHANG: "Ouest", FOUMBAN: "Ouest",
  NGAOUNDERE: "Adamaoua", MEIGANGA: "Adamaoua",
  GAROUA: "Nord", GUIDER: "Nord", FIGUIL: "Nord",
  MAROUA: "Extrême-Nord", KOUSSERI: "Extrême-Nord",
  BERTOUA: "Est", BATOURI: "Est", BELABO: "Est", "ABONG MBANG": "Est",
  BAMENDA: "Nord-Ouest", KUMBO: "Nord-Ouest",
};

// Mise en forme lisible : "SOCIETE ANONYME DES BRASSERIES" -> "Societe Anonyme Des Brasseries"
const titre = (s) => (s || "").toLowerCase().replace(/(^|[\s'(\-/])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).trim();

function lireCSV(file) {
  const [entete, ...lignes] = fs.readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(Boolean);
  const cols = entete.split(";");
  return lignes.map((l) => {
    const v = l.split(";");
    return Object.fromEntries(cols.map((c, i) => [c, (v[i] || "").trim()]));
  });
}

async function main() {
  if (!fs.existsSync(FICHIER)) {
    console.log("Fichier des grandes industries absent (local-test/data/ge-gi-classe.csv) : import ignoré.");
    return false;
  }
  const rows = lireCSV(FICHIER);
  const filieres = new Map((await prisma.filiere.findMany()).map((f) => [f.code, f]));
  const activites = new Map((await prisma.activite.findMany({ where: { niveau: "CLASSE" } })).map((a) => [a.code, a]));

  let n = 0;
  for (const r of rows) {
    const ville = r.ville.toUpperCase();
    const region = REGION_DE_VILLE[ville] || "Inconnu";
    const activite = activites.get(r.code_citi);
    const filiere = filieres.get(r.filiere);
    const champ = activite ? ["B", "C", "D", "E"].includes(activite.section) : false;
    await prisma.entreprise.create({
      data: {
        referenceSPI: `SPI-GI-${String(r.num).padStart(3, "0")}`,
        denomination: r.raison_sociale,
        sigle: r.sigle || null,
        ville: titre(r.ville),
        region,
        telephone: r.telephone || null,
        produitsPrincipaux: titre(r.activite),
        activiteCode: activite ? activite.code : null,
        filiereCode: filiere ? filiere.code : null,
        secteurActivite: filiere ? filiere.libelle : "Hors filière",
        champIndustriel: champ,
        taille: "GE",
        statut: "ACTIF",
        etablissements: {
          create: {
            principal: true,
            nom: "Siège / site principal",
            activiteCode: activite ? activite.code : null,
            region,
            ville: titre(r.ville),
            quartier: titre(r.quartier) || null,
            lieuDit: titre(r.lieu_dit) || null,
            telephone: r.telephone || null,
          },
        },
      },
    });
    n++;
  }
  console.log(`✅ ${n} grandes industries importées (classement CITI en brouillon, à valider)`);
  return true;
}

main()
  .then((ok) => process.exit(ok ? 0 : 2)) // code 2 = fichier absent (setup-local bascule sur les données de démonstration)
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
