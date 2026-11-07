# Mise à jour de la base Render — déclarations multi-produits

## État constaté le 7 novembre 2026

- `https://portail-spi-cam.onrender.com` répond **« Service Suspended »** : le service web est suspendu.
- La base PostgreSQL Render (`dpg-d8l91pt8nd3s73e1ef40-a`) refuse les connexions : elle est suspendue
  ou **expirée** (les bases gratuites Render expirent 30 jours après leur création ; celle-ci date de juin 2026).
- Le fichier `.env.local` contient une URL d'exemple (`your-db-host.onrender.com`). Il prime sur `.env`
  en local avec `npm run dev` : à corriger ou supprimer si vous lancez le projet contre PostgreSQL.

## Comment la base est mise à jour

Le build Render lance `npm run db:deploy` (`scripts/db-deploy.js`) **avant** `npm run build` :

1. `prisma db push` aligne la base sur `prisma/schema.prisma` : tables `Produit` et `LigneProduction`,
   colonnes `motifRejet`. **Sans `--accept-data-loss`** : si un changement devait supprimer des données,
   Prisma refuse, le build échoue et la version en ligne reste en place.
2. Chaque ancienne saisie mono-produit (production physique en tonnes) reçoit une ligne produit
   « Production physique (ancienne saisie) ». Le script est relançable sans créer de doublons.

Testé en local : sur une base au format actuel de Render, avec reprise des anciennes saisies,
second passage sans doublon, et refus si des données devaient être perdues.

> Le projet n'utilise pas l'historique `prisma/migrations` (la migration initiale ne correspond plus
> au schéma). Ne lancez pas `prisma migrate deploy` / `npm run db:migrate` sur la base Render.

## Marche à suivre

### Cas A — l'ancienne base existe encore (réactivée ou passée en offre payante)

1. Dans Render, réactivez la base puis le service web.
2. **Sauvegarde** : Base → *Backups* / *Export*, ou en local :
   `pg_dump "<External Database URL>" > sauvegarde-avant-maj.sql`
3. Vérifiez que la variable `DATABASE_URL` du service web contient l'**Internal Database URL**.
4. `git push` → le build lance la mise à jour de la base, puis déploie.
5. Si le build échoue avec « data loss » : **ne forcez pas**. La base contient des colonnes absentes du
   schéma (par ex. `investissements`). Notez le message et décidez colonne par colonne
   (l'ajouter au schéma pour la garder, ou accepter sa suppression après sauvegarde).

### Cas B — la base a expiré (supprimée par Render)

1. Créez une nouvelle base PostgreSQL dans Render.
2. Copiez son **Internal Database URL** dans la variable `DATABASE_URL` du service web.
3. Réactivez le service web, puis `git push` : le build crée toutes les tables.
4. Créez les comptes (avec un mot de passe **différent** de `SpiCam2026!`) et rechargez les entreprises,
   par exemple avec `scripts/seed-users.js` puis `prisma/seed-enterprises-150.js` lancés une fois avec
   `DATABASE_URL` pointant vers la nouvelle base (External Database URL).
   Les données de production saisies sur l'ancienne base sont perdues si elle n'a pas été sauvegardée.

### Après le déploiement

- Connexion admin, puis vérification des pages Entreprises, Production et Conjoncture.
- Changez les mots de passe de tous les comptes (Paramètres → Mon compte).

## Comptes utilisateurs (sécurité)

Le déploiement ne touche pas aux comptes. Pour appliquer en production la réinitialisation décidée
(suppression de tous les comptes, compte unique « Spysoft » super administrateur), lancer **une fois**,
après sauvegarde de la base, avec `DATABASE_URL` pointant vers la base Render (External Database URL) :

    node scripts/reinitialiser-comptes.js --confirmer

Puis se connecter avec l'identifiant `Spysoft` et le mot de passe provisoire `SpiCam2026!` (changement
obligatoire), et recréer les comptes depuis Paramètres > Utilisateurs.
