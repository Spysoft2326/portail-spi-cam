#!/bin/bash
npm install

# Afficher le contenu du schema-fixed avant copie
echo "Contenu de schema-fixed.prisma:"
head -5 prisma/schema-fixed.prisma

# Copier le schema fixe
cp prisma/schema-fixed.prisma prisma/schema.prisma

# Afficher le contenu du schema apres copie
echo "Contenu de schema.prisma apres copie:"
head -5 prisma/schema.prisma

# Verifier
if ! grep -q "model Entreprise" prisma/schema.prisma; then
  echo "ERREUR: Schema Prisma incorrect"
  exit 1
fi

rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push
node prisma/seed-enterprises-150.js
node prisma/seed-users.js
npm run build