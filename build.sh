#!/bin/bash
npm install

# Vérifier et corriger le schéma Prisma si nécessaire
if ! grep -q "model Entreprise" prisma/schema.prisma; then
  echo "Corriger le schéma Prisma..."
  sed -i 's/model entreprise/model Entreprise/g' prisma/schema.prisma
  sed -i 's/entreprise    Enterprise/Entreprise    Entreprise/g' prisma/schema.prisma
fi

rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push
node prisma/seed-enterprises-150.js
node prisma/seed-users.js
npm run build