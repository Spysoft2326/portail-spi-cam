-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'AGENT_SAISIE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "Entreprise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceSPI" TEXT NOT NULL,
    "denomination" TEXT NOT NULL,
    "sigle" TEXT,
    "formeJuridique" TEXT,
    "capitalSocial" REAL,
    "dateCreation" DATETIME,
    "numRegistreCommerce" TEXT,
    "numContribuable" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "departement" TEXT,
    "region" TEXT NOT NULL DEFAULT 'CENTRE',
    "codePostal" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "telephone" TEXT,
    "email" TEXT,
    "siteWeb" TEXT,
    "secteurActivite" TEXT NOT NULL DEFAULT 'AUTRE',
    "sousSecteur" TEXT,
    "produitsPrincipaux" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ACTIF',
    "estExportateur" BOOLEAN NOT NULL DEFAULT false,
    "estDansZoneIndustrielle" BOOLEAN NOT NULL DEFAULT false,
    "nomZoneIndustrielle" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProductionData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "annee" INTEGER NOT NULL,
    "periode" TEXT NOT NULL DEFAULT 'TRIMESTRIEL',
    "semestre" INTEGER,
    "trimestre" INTEGER,
    "volumeProduit" REAL,
    "valeurProduction" REAL,
    "chiffreAffaires" REAL,
    "nombreEmployes" INTEGER,
    "capaciteUtilisee" REAL,
    "tauxQualite" REAL,
    "tauxDisponibilite" REAL,
    "volumeExport" REAL,
    "valeurExport" REAL,
    "sourceDonnee" TEXT,
    "statutValidation" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "dateSaisie" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidation" DATETIME,
    "validePar" TEXT,
    "commentaireRejet" TEXT,
    "entrepriseId" TEXT NOT NULL,
    "saisieParId" TEXT NOT NULL,
    CONSTRAINT "ProductionData_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProductionData_saisieParId_fkey" FOREIGN KEY ("saisieParId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NoteConjoncture" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "periodeReference" TEXT NOT NULL,
    "typeNote" TEXT NOT NULL DEFAULT 'GLOBALE',
    "resumeExecutif" TEXT,
    "analyseMacro" TEXT,
    "analyseSectorielle" TEXT,
    "perspectives" TEXT,
    "recommandations" TEXT,
    "ipcIndustriel" REAL,
    "tauxCroissance" REAL,
    "nombreEntreprisesActives" INTEGER,
    "dateRedaction" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "datePublication" DATETIME,
    "statutPublication" TEXT NOT NULL DEFAULT 'BROUILLON',
    "redacteurId" TEXT NOT NULL,
    "entrepriseId" TEXT,
    "entreprisesCitees" TEXT,
    "secteursConcernes" TEXT,
    CONSTRAINT "NoteConjoncture_redacteurId_fkey" FOREIGN KEY ("redacteurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NoteConjoncture_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomFichier" TEXT NOT NULL,
    "typeDocument" TEXT NOT NULL DEFAULT 'AUTRE',
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "taille" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entrepriseId" TEXT,
    "noteConjonctureId" TEXT,
    CONSTRAINT "Document_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Document_noteConjonctureId_fkey" FOREIGN KEY ("noteConjonctureId") REFERENCES "NoteConjoncture" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfigSystem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "anneeEnCours" INTEGER NOT NULL DEFAULT 2026,
    "seuilAlerteProduction" REAL,
    "emailNotifications" TEXT,
    "frequenceRappelSaisie" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_referenceSPI_key" ON "Entreprise"("referenceSPI");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_denomination_key" ON "Entreprise"("denomination");

-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_numContribuable_key" ON "Entreprise"("numContribuable");

-- CreateIndex
CREATE INDEX "ProductionData_entrepriseId_annee_idx" ON "ProductionData"("entrepriseId", "annee");

-- CreateIndex
CREATE INDEX "ProductionData_saisieParId_idx" ON "ProductionData"("saisieParId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_noteConjonctureId_key" ON "Document"("noteConjonctureId");
