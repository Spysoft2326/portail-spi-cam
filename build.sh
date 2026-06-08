#!/bin/bash
npm install

# Copier le schema fixe
cp prisma/schema-fixed.prisma prisma/schema.prisma

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
npm run build# Forcer le remplacement du schema Prisma
cat > prisma/schema.prisma << 'EOF'
...
EOF

# Verifier que le schema est correct
if ! grep -q "model Entreprise" prisma/schema.prisma; then
  echo "ERREUR: Schema Prisma incorrect"
  exit 1
fi

# Supprimer TOUT le cache Prisma
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
rm -rf ~/.cache/prisma

# Generer le client
npx prisma generate --schema=prisma/schema.prisma

# Verifier que le client a Entreprise
if ! grep -q "Entreprise" node_modules/@prisma/client/index.d.ts; then
  echo "ERREUR: Client Prisma incorrect"
  exit 1
fi

npx prisma db push
node prisma/seed-enterprises-150.js
node prisma/seed-users.js
npm run build