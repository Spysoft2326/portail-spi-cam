#!/bin/sh
rm -rf node_modules
npm install

# Verifier le schema actuel
echo "Schema avant correction:"
head -5 prisma/schema.prisma

# Corriger le schema
sed -i 's/model entreprise/model Entreprise/g' prisma/schema.prisma
sed -i 's/entreprise    Enterprise/Entreprise    Entreprise/g' prisma/schema.prisma

# Verifier le schema apres correction
echo "Schema apres correction:"
head -5 prisma/schema.prisma

# Verifier
if ! grep -q "model Entreprise" prisma/schema.prisma; then
  echo "ERREUR: Schema Prisma incorrect"
  exit 1
fi

npx prisma generate --schema=prisma/schema.prisma
npx prisma db push
node prisma/seed-enterprises-150.js
node prisma/seed-users.js
npm run build