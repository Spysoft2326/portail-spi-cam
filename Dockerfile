# Étape 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Dépendances système pour Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
COPY .env.production ./.env
RUN npx prisma generate

COPY . .
RUN npm run build

# Étape 2: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.js ./

# Générer Prisma client dans l'image finale
RUN npx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node scripts/seed-users.js && node scripts/seed-enterprises.js && npm start"]
