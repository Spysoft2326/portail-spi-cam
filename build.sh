#!/bin/bash
npm install

# Forcer le remplacement du schema Prisma
cat > prisma/schema.prisma << 'EOF'
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          String    @default("AGENT_SAISIE")
  isActive      Boolean   @default(true)
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Entreprise {
  id                      String       @id @default(uuid())
  referenceSPI            String       @unique
  denomination            String
  sigle                   String?
  formeJuridique          String?
  capitalSocial           Float?
  adresse                 String?
  ville                   String?
  departement             String?
  region                  String
  telephone               String?
  email                   String?
  siteWeb                 String?
  numContribuable         String?
  secteurActivite         String       @default("AUTRE")
  sousSecteur             String?
  produitsPrincipaux      String?
  statut                  String       @default("ACTIF")
  estExportateur          Boolean      @default(false)
  estDansZoneIndustrielle Boolean      @default(false)
  nomZoneIndustrielle     String?
  createdAt               DateTime     @default(now())
  updatedAt               DateTime     @updatedAt
  productions             Production[]
}

model Production {
  id                  String     @id @default(uuid())
  entrepriseId        String
  entreprise          Entreprise @relation(fields: [entrepriseId], references: [id])
  
  // Periode
  annee               Int
  trimestre           Int        // 1, 2, 3, 4
  
  // Donnees de production
  productionPhysique  Float?     // Tonnes, unites...
  chiffreAffaires     Float?     // En FCFA
  effectifs           Int?       // Nombre de salaries
  investissements     Float?     // En FCFA
  
  // Metadonnees
  commentaire         String?
  
  // Workflow
  statut              String     @default("EN_ATTENTE") // EN_ATTENTE, VALIDEE, REJETEE
  saisiePar           String     // ID de l'agent
  validePar           String?    // ID de l'admin/super-admin
  dateSaisie          DateTime   @default(now())
  dateValidation      DateTime?
  
  // Audit
  createdAt           DateTime   @default(now())
  updatedAt           DateTime   @updatedAt
  
  @@unique([entrepriseId, annee, trimestre])
  @@index([entrepriseId])
  @@index([annee, trimestre])
  @@index([statut])
}

model ConfigSystem {
  id          String   @id @default(uuid())
  cle         String   @unique
  valeur      String
  description String?
  updatedAt   DateTime @updatedAt
}

model AuditLog {
  id        String   @id @default(uuid())
  action    String
  userId    String?
  details   String?
  createdAt DateTime @default(now())
}
EOF

rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push
node prisma/seed-enterprises-150.js
node prisma/seed-users.js
npm run build