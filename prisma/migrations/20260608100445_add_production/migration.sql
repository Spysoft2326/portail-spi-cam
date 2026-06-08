/*
  Warnings:

  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NoteConjoncture` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductionData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `entite` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `entiteId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `anneeEnCours` on the `ConfigSystem` table. All the data in the column will be lost.
  - You are about to drop the column `emailNotifications` on the `ConfigSystem` table. All the data in the column will be lost.
  - You are about to drop the column `frequenceRappelSaisie` on the `ConfigSystem` table. All the data in the column will be lost.
  - You are about to drop the column `seuilAlerteProduction` on the `ConfigSystem` table. All the data in the column will be lost.
  - You are about to drop the column `codePostal` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `dateCreation` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `numRegistreCommerce` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - Added the required column `cle` to the `ConfigSystem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ConfigSystem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valeur` to the `ConfigSystem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Document_noteConjonctureId_key";

-- DropIndex
DROP INDEX "ProductionData_saisieParId_idx";

-- DropIndex
DROP INDEX "ProductionData_entrepriseId_annee_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Document";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "NoteConjoncture";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProductionData";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Production" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entrepriseId" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "trimestre" INTEGER NOT NULL,
    "productionPhysique" REAL,
    "chiffreAffaires" REAL,
    "effectifs" INTEGER,
    "investissements" REAL,
    "commentaire" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
    "saisiePar" TEXT NOT NULL,
    "validePar" TEXT,
    "dateSaisie" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateValidation" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Production_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_AuditLog" ("action", "createdAt", "details", "id", "userId") SELECT "action", "createdAt", "details", "id", "userId" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE TABLE "new_ConfigSystem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ConfigSystem" ("id") SELECT "id" FROM "ConfigSystem";
DROP TABLE "ConfigSystem";
ALTER TABLE "new_ConfigSystem" RENAME TO "ConfigSystem";
CREATE UNIQUE INDEX "ConfigSystem_cle_key" ON "ConfigSystem"("cle");
CREATE TABLE "new_Entreprise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceSPI" TEXT NOT NULL,
    "denomination" TEXT NOT NULL,
    "sigle" TEXT,
    "formeJuridique" TEXT,
    "capitalSocial" REAL,
    "adresse" TEXT,
    "ville" TEXT,
    "departement" TEXT,
    "region" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "siteWeb" TEXT,
    "numContribuable" TEXT,
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
INSERT INTO "new_Entreprise" ("adresse", "capitalSocial", "createdAt", "denomination", "departement", "email", "estDansZoneIndustrielle", "estExportateur", "formeJuridique", "id", "nomZoneIndustrielle", "numContribuable", "produitsPrincipaux", "referenceSPI", "region", "secteurActivite", "sigle", "siteWeb", "sousSecteur", "statut", "telephone", "updatedAt", "ville") SELECT "adresse", "capitalSocial", "createdAt", "denomination", "departement", "email", "estDansZoneIndustrielle", "estExportateur", "formeJuridique", "id", "nomZoneIndustrielle", "numContribuable", "produitsPrincipaux", "referenceSPI", "region", "secteurActivite", "sigle", "siteWeb", "sousSecteur", "statut", "telephone", "updatedAt", "ville" FROM "Entreprise";
DROP TABLE "Entreprise";
ALTER TABLE "new_Entreprise" RENAME TO "Entreprise";
CREATE UNIQUE INDEX "Entreprise_referenceSPI_key" ON "Entreprise"("referenceSPI");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "image" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'AGENT_SAISIE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "isActive", "name", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "isActive", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Production_entrepriseId_idx" ON "Production"("entrepriseId");

-- CreateIndex
CREATE INDEX "Production_annee_trimestre_idx" ON "Production"("annee", "trimestre");

-- CreateIndex
CREATE INDEX "Production_statut_idx" ON "Production"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "Production_entrepriseId_annee_trimestre_key" ON "Production"("entrepriseId", "annee", "trimestre");
