#!/bin/bash
rm -rf node_modules

# Supprimer le postinstall pour eviter la generation prematuree
sed -i '/"postinstall"/d' package.json

npm install

# Creer le schema Prisma directement
cat > prisma/schema.prisma << 'EOF'
...
EOF

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