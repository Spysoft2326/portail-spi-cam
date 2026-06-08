#!/bin/sh
rm -rf node_modules

# Supprimer le postinstall pour eviter la generation prematuree
node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync('package.json','utf8')); delete p.scripts.postinstall; fs.writeFileSync('package.json',JSON.stringify(p,null,2));"

npm install

# Corriger le schema avec node
node -e "const fs=require('fs'); let s=fs.readFileSync('prisma/schema.prisma','utf8'); s=s.replace(/model entreprise/g,'model Entreprise'); s=s.replace(/entreprise    Enterprise/g,'Entreprise    Entreprise'); fs.writeFileSync('prisma/schema.prisma',s);"

# Supprimer le cache global de Prisma
rm -rf ~/.cache/prisma
rm -rf ~/.npm/_npx

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