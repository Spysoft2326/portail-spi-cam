#!/bin/bash
npm install
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
npx prisma generate --schema=prisma/schema.prisma
npx prisma db push
node prisma/seed-enterprises-150.js
node prisma/seed-users.js
npm run build
