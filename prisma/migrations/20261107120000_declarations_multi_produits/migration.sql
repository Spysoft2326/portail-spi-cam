-- AlterTable
ALTER TABLE "Entreprise" ADD COLUMN     "motifRejet" TEXT;

-- AlterTable
ALTER TABLE "Production" ADD COLUMN     "motifRejet" TEXT;

-- CreateTable
CREATE TABLE "Produit" (
    "id" TEXT NOT NULL,
    "entrepriseId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "unite" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneProduction" (
    "id" TEXT NOT NULL,
    "productionId" TEXT NOT NULL,
    "produitId" TEXT,
    "produit" TEXT NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL,
    "unite" TEXT NOT NULL,

    CONSTRAINT "LigneProduction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Produit_entrepriseId_nom_key" ON "Produit"("entrepriseId", "nom");

-- CreateIndex
CREATE INDEX "LigneProduction_productionId_idx" ON "LigneProduction"("productionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Production_entrepriseId_idx" ON "Production"("entrepriseId");

-- CreateIndex
CREATE INDEX "Production_annee_trimestre_idx" ON "Production"("annee", "trimestre");

-- AddForeignKey
ALTER TABLE "Produit" ADD CONSTRAINT "Produit_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneProduction" ADD CONSTRAINT "LigneProduction_productionId_fkey" FOREIGN KEY ("productionId") REFERENCES "Production"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneProduction" ADD CONSTRAINT "LigneProduction_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ============================================================
-- Reprise des données : chaque ancienne saisie mono-produit
-- devient une déclaration avec une ligne produit.
-- (l'ancien formulaire enregistrait la production physique en tonnes)
-- ============================================================
INSERT INTO "LigneProduction" ("id", "productionId", "produitId", "produit", "quantite", "unite")
SELECT
    gen_random_uuid()::text,
    p."id",
    NULL,
    COALESCE(NULLIF(TRIM(p."produit"), ''), 'Production physique (ancienne saisie)'),
    COALESCE(p."productionPhysique", p."quantite"),
    COALESCE(NULLIF(TRIM(p."unite"), ''), 't')
FROM "Production" p
WHERE COALESCE(p."productionPhysique", p."quantite") IS NOT NULL;
