#!/bin/sh
rm -rf node_modules
npm install

# Corriger le schema avec node
node -e "const fs=require('fs'); let s=fs.readFileSync('prisma/schema.prisma','utf8'); s=s.replace(/model entreprise/g,'model Entreprise'); s=s.replace(/entreprise    Enterprise/g,'Entreprise    Entreprise'); fs.writeFileSync('prisma/schema.prisma',s);"

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