#!/bin/bash
npm install

# Verifier et corriger le schema Prisma si necessaire
if ! grep -q "model Entreprise" prisma/schema.prisma; then
  echo "Corriger le schema Prisma..."
  node -e "const fs=require('fs'); let s=fs.readFileSync('prisma/schema.prisma','utf8'); s=s.replace(/model entreprise/g,'model Entreprise'); s=s.replace(/entreprise    Enterprise/g,'Entreprise    Entreprise'); fs.writeFileSync('prisma/schema.prisma',s);"
fi

rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push
node prisma/seed-enterprises-150.js
node prisma/seed-users.js
npm run build