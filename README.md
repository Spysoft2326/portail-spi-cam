# Portail SPI Cam

## Portail de Suivi de la Production Industrielle du Cameroun

### 🚀 Démarrage rapide (SANS Docker - SQLite)

```bash
# 1. Extraire le projet
cd portail-spi-cam

# 2. Installer les dépendances
npm install

# 3. Copier le fichier d'environnement
cp .env.example .env

# 4. Générer le client Prisma
npx prisma generate

# 5. Créer la base de données SQLite
npx prisma db push

# 6. Créer les utilisateurs de test
node scripts/seed-users.js

# 7. Lancer le serveur
npm run dev
```

### ⚡ En une seule commande

```bash
npm install && npx prisma generate && npx prisma db push && node scripts/seed-users.js && npm run dev
```

### 👤 Comptes et droits d'accès

Un seul compte existe au départ : le super administrateur **Spysoft**.

| Identifiant | Mot de passe provisoire | Rôle |
|-------------|-------------------------|------|
| `Spysoft` | `SpiCam2026!` | SUPER_ADMIN |

- Le changement du mot de passe provisoire est **obligatoire** à la première connexion
  (10 caractères minimum, majuscules, minuscules, chiffre et caractère spécial).
- Spysoft crée les autres comptes (Paramètres > Utilisateurs) et leur attribue un rôle ; chaque nouveau
  compte reçoit le même mot de passe provisoire, à changer à la première connexion.
- Politique « qui peut le plus peut le moins » : SUPER_ADMIN > ADMIN > AGENT_SAISIE
  (un rôle a tous les droits des rôles inférieurs). Les administrateurs modifient les comptes des agents
  (informations, activation, réinitialisation du mot de passe). Voir `lib/rbac.ts`.
- 5 échecs de connexion consécutifs bloquent le compte 15 minutes.
- Repartir de zéro (supprime tous les comptes, recrée Spysoft) :
  `node scripts/reinitialiser-comptes.js --confirmer`

### 📁 Structure du projet

```
portail-spi-cam/
├── app/                 # Next.js App Router
│   ├── (public)/        # Routes publiques
│   ├── (auth)/          # Routes protégées
│   └── api/             # API Routes
├── components/          # Composants React
├── lib/                 # Utilitaires
├── prisma/              # Schéma de données
│   └── schema.prisma    # Schéma SQLite
│   └── dev.db           # Base de données SQLite (créée automatiquement)
├── scripts/             # Scripts (seed)
└── types/               # Types TypeScript
```

### 🛠️ Stack technique

- **Frontend** : Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de données** : SQLite (fichier local, pas besoin de Docker)
- **Auth** : NextAuth.js avec bcrypt
- **Cartographie** : Leaflet / React-Leaflet
- **Graphiques** : Recharts
- **Export** : React-PDF, jspdf-autotable

### 📝 Scripts disponibles

```bash
npm run dev              # Développement
npm run build            # Production
npm run db:generate      # Générer Prisma Client
npm run db:migrate       # Migrer la base de données
npm run db:seed          # Créer les utilisateurs de test
npm run db:studio        # Ouvrir Prisma Studio
npm run db:push          # Push schema sans migration
npm run db:reset         # Reset complet + seed
npm run setup            # Setup complet (install + generate + push + seed + dev)
```

### 🔧 Dépannage

**Erreur "@prisma/client did not initialize yet"**
→ Exécuter `npx prisma generate`

**Erreur "Identifiant ou mot de passe incorrect"**
→ Vérifier l'identifiant ; après 5 échecs le compte est bloqué 15 minutes. Un super administrateur peut
réinitialiser le mot de passe (Paramètres > Utilisateurs).

**Base de données corrompue**
→ Supprimer `prisma/dev.db` et relancer `npx prisma db push && node scripts/seed-users.js`

### 📄 Licence

© 2026 Portail SPI Cam - Ministère des Mines, de l'Industrie et du Développement Technologique du Cameroun
