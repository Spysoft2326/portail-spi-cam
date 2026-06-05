# ============================================================
# CHECKLIST DÉPLOIEMENT RENDER - Portail SPI Cam
# ============================================================

## ✅ PRÉ-REQUIS
- [ ] Compte Render créé (https://render.com)
- [ ] Compte GitHub avec repo du projet
- [ ] Fichier `render.yaml` poussé sur GitHub

## ✅ ÉTAPE 1 : PRÉPARATION DU PROJET
- [ ] Copier `schema.prisma` dans `prisma/schema.prisma`
- [ ] Copier `next.config.js` à la racine
- [ ] Copier `route.ts` dans `app/api/auth/[...nextauth]/`
- [ ] Copier `seed-render.js` dans `scripts/`
- [ ] Copier `.env.production` en `.env` (local uniquement)
- [ ] Modifier `package.json` : ajouter script "postinstall": "prisma generate"

## ✅ ÉTAPE 2 : PUSH SUR GITHUB
```bash
git add .
git commit -m "Phase 5 : Déploiement Render"
git push origin main
```

## ✅ ÉTAPE 3 : CRÉER LE SERVICE RENDER
1. Aller sur https://dashboard.render.com
2. Cliquer "New +" → "Blueprint"
3. Sélectionner le repo GitHub
4. Render détecte automatiquement `render.yaml`
5. Cliquer "Apply"

## ✅ ÉTAPE 4 : CONFIGURER LES VARIABLES D'ENV
1. Dans le dashboard Render, aller sur le Web Service
2. Onglet "Environment"
3. Vérifier que `NEXTAUTH_SECRET` est généré
4. Vérifier que `DATABASE_URL` pointe sur la DB Render

## ✅ ÉTAPE 5 : SEEDING (première fois)
```bash
# Option A : Via Render Shell
render shell
node scripts/seed-render.js

# Option B : En local avec la DB Render
# Copier DATABASE_URL de Render dans .env
npx prisma db push
node scripts/seed-render.js
```

## ✅ ÉTAPE 6 : VÉRIFICATION POST-DÉPLOIEMENT
- [ ] Health check : `https://votre-url.onrender.com/api/health`
- [ ] Page d'accueil publique accessible
- [ ] Login fonctionnel (superadmin@spi-cam.cm / SpiCam2026!)
- [ ] Dashboard agent accessible
- [ ] Carte Leaflet affiche les entreprises
- [ ] Recherche entreprises fonctionnelle

## ✅ ÉTAPE 7 : TESTS PAR RÔLE
### PUBLIC (sans connexion)
- [ ] Accès page d'accueil
- [ ] Recherche entreprises
- [ ] Fiche entreprise basique
- [ ] Export PDF public

### AGENT_SAISIE
- [ ] Login agent1@spi-cam.cm
- [ ] Dashboard agent
- [ ] Saisie production
- [ ] Modification saisies avant validation

### ADMIN
- [ ] Login admin@spi-cam.cm
- [ ] File d'attente validation
- [ ] Validation/Rejet données
- [ ] Gestion entreprises

### SUPER_ADMIN
- [ ] Login superadmin@spi-cam.cm
- [ ] Gestion utilisateurs
- [ ] Configuration système
- [ ] Logs d'audit

## ✅ DÉPANNAGE

### Erreur "Prisma Client did not initialize"
→ Exécuter `npx prisma generate` puis redéployer

### Erreur "NEXTAUTH_URL mismatch"
→ Vérifier que NEXTAUTH_URL = URL exacte Render (avec https://)

### Erreur "Database connection failed"
→ Vérifier DATABASE_URL dans Render Dashboard
→ Vérifier que la DB est "Available"

### Build timeout (15 min sur Free Tier)
→ Optimiser : supprimer dépendances inutiles
→ Utiliser `output: 'standalone'` dans next.config.js

### Erreur "Module not found"
→ Vérifier que `prisma generate` est dans le buildCommand

## ✅ CONTACTS
- Render Support : https://render.com/docs
- Prisma Docs : https://prisma.io/docs
- NextAuth Docs : https://next-auth.js.org
