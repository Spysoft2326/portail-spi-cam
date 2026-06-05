# 🚀 PHASE 5 : DÉPLOIEMENT RENDER - Portail SPI Cam

## 📦 Fichiers générés

| Fichier | Destination | Description |
|---------|-------------|-------------|
| `schema.prisma` | `prisma/schema.prisma` | Schéma PostgreSQL (remplace SQLite) |
| `next.config.js` | Racine du projet | Config Next.js standalone pour Render |
| `route.ts` | `app/api/auth/[...nextauth]/route.ts` | NextAuth avec credentials |
| `seed-render.js` | `scripts/seed-render.js` | 100 entreprises + utilisateurs |
| `render.yaml` | Racine du projet | Blueprint Render (infra-as-code) |
| `.env.production` | `cp .env.production .env` | Template variables d'env |
| `Dockerfile` | Racine du projet | Build multi-stage (optionnel) |
| `health.ts` | `app/api/health/route.ts` | Health check API |
| `DEPLOY_CHECKLIST.md` | Racine du projet | Checklist complète |

---

## 🎯 ÉTAPES DE DÉPLOIEMENT (15 minutes)

### 1. COPIER LES FICHIERS

```bash
# Dans votre dossier projet portail-spi-cam
cp /chemin/vers/schema.prisma prisma/schema.prisma
cp /chemin/vers/next.config.js next.config.js
cp /chemin/vers/route.ts app/api/auth/[...nextauth]/route.ts
cp /chemin/vers/seed-render.js scripts/seed-render.js
cp /chemin/vers/render.yaml render.yaml
cp /chemin/vers/Dockerfile Dockerfile
cp /chemin/vers/health.ts app/api/health/route.ts
cp /chemin/vers/DEPLOY_CHECKLIST.md DEPLOY_CHECKLIST.md
```

### 2. MODIFIER PACKAGE.JSON

Ajouter dans `scripts` :
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "node scripts/seed-render.js",
    "db:studio": "prisma studio",
    "db:push": "prisma db push",
    "db:reset": "prisma migrate reset --force && npm run db:seed"
  }
}
```

### 3. POUSSER SUR GITHUB

```bash
git add .
git commit -m "Phase 5 : Déploiement Render - PostgreSQL + 100 entreprises"
git push origin main
```

### 4. CRÉER LE SERVICE RENDER

1. Aller sur https://dashboard.render.com
2. **New +** → **Blueprint**
3. Sélectionner votre repo `portail-spi-cam`
4. Render détecte automatiquement `render.yaml`
5. Cliquer **Apply**
6. Attendre le déploiement (~5-10 min)

### 5. SEEDING (une seule fois)

```bash
# Via le Shell Render (dans le dashboard)
render shell
node scripts/seed-render.js
```

---

## 🔧 CONFIGURATION MANUELLE (si render.yaml ne fonctionne pas)

### Créer manuellement :

**1. PostgreSQL Database**
- New + → PostgreSQL
- Name : `portail-spi-cam-db`
- Plan : Free
- Region : Frankfurt (EU) ou Oregon (US)

**2. Web Service**
- New + → Web Service
- Repo : votre GitHub
- Runtime : Node
- Build Command :
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```
- Start Command : `npm start`
- Plan : Free

**3. Variables d'environnement**
```
NODE_ENV=production
NEXTAUTH_SECRET=<généré automatiquement>
NEXTAUTH_URL=https://votre-url.onrender.com
DATABASE_URL=<copier depuis la DB Render>
```

---

## ✅ VÉRIFICATION POST-DÉPLOIEMENT

| Test | URL | Résultat attendu |
|------|-----|-----------------|
| Health | `/api/health` | `{"status":"healthy"}` |
| Accueil | `/` | Page publique avec stats |
| Login | `/login` | Formulaire de connexion |
| Dashboard | `/dashboard/agent` | Redirection si non connecté |

---

## 🚨 DÉPANNAGE RAPIDE

### Problème : Build échoue
```bash
# Vérifier les logs Render
# Solution : augmenter le timeout ou passer au plan Starter
```

### Problème : "Prisma Client not initialized"
```bash
# Dans le shell Render :
npx prisma generate
npm run build
```

### Problème : "Cannot find module"
```bash
# Vérifier que postinstall est dans package.json
npm run postinstall
```

### Problème : Auth ne fonctionne pas
- Vérifier `NEXTAUTH_URL` = URL exacte Render (https://...)
- Vérifier `NEXTAUTH_SECRET` est défini
- Vérifier que les utilisateurs sont seedés

---

## 📊 ARCHITECTURE RENDER

```
┌─────────────────┐
│   Render Web    │  Next.js 14 (Port 3000)
│   Service       │  - Auth NextAuth
│   (Free Tier)   │  - API Routes
└────────┬────────┘  - Prisma Client
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌────────┐
│Render  │ │Render  │
│PostgreSQL│ │Redis   │  (optionnel)
│(Free)   │ │(Free)  │
└────────┘ └────────┘
```

---

## 📞 SUPPORT

- **Render Docs** : https://render.com/docs
- **Prisma Docs** : https://prisma.io/docs
- **NextAuth Docs** : https://next-auth.js.org
- **Next.js Docs** : https://nextjs.org/docs

---

© 2026 Portail SPI Cam - Phase 5 Déploiement
