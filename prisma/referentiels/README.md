# Référentiels du portail : nomenclature des activités et filières

## Pourquoi

Jusqu'ici, le secteur d'une entreprise était un texte libre (17 libellés « maison »), sans lien avec la
nomenclature officielle. Au Cameroun, la **NACAM** (nomenclature des activités, INS, 2013), fondée sur la
**CITI Rév.4** des Nations Unies, est obligatoire pour la production de statistiques
(décret n° 2016/0895/PM du 3 mai 2016). Le portail classe désormais chaque entreprise avec un **code
d'activité**, d'où sont déduits sa **filière** et son appartenance au **champ industriel**.

## Fichiers

| Fichier | Contenu |
|---|---|
| `citi4.json` | CITI Rév.4 complète : 21 sections, 88 divisions, 238 groupes, 419 classes (extraite du PDF ONU ST/ESA/STAT/SER.M/4/Rev.4 par `scripts/nomenclature/extraire-citi4.py`) |
| `filieres.json` | 14 filières et la **table de passage** code CITI → filière (préfixes ; le plus long l'emporte) |

## Modèle de données

- `Activite` : la nomenclature (hiérarchie section > division > groupe > classe). Le champ `codeNacam`
  est prévu pour la correspondance NACAM Rév.1 (43 branches, 146 classes) dès réception du texte officiel de l'INS.
- `Filiere` + `FiliereRegle` : filières du pilotage industriel et table de passage.
- `Entreprise.activiteCode` (classe à 4 chiffres, obligatoire à la création) → `filiereCode` (déduite,
  ou forcée par un administrateur : `filiereManuelle`) et `champIndustriel` (sections B, C, D, E).
  `secteurActivite` reprend le libellé de la filière pour l'affichage public et la conjoncture.
- `Etablissement` : sites / usines d'une entreprise (région, ville, quartier, lieu-dit, classe
  d'établissement classé 1 ou 2 au sens de la loi n° 98/015).
- `Entreprise.numContribuable` (NIU, unicité contrôlée), `taille` (GE, PME, TPE), `Produit.codeNpc`.

## Filières (brouillon à valider)

Les 8 premières reprennent les sous-secteurs industriels prioritaires de la SND30 (★) ; le 9e n'a pas pu être
confirmé. Une filière est une **chaîne de valeur** : elle peut contenir des activités hors champ industriel
(ex. distribution de produits pétroliers 4661 → Hydrocarbures ; achat-export de cacao 4620 → Agro-industrie).

| Filière | Codes CITI rattachés |
|---|---|
| ★ Agro-industrie | 10, 11, 12 (+ 01, 03, 4620) |
| ★ Forêt-bois | 02, 16, 31 |
| ★ Textile-confection-cuir | 13, 14, 15 (+ 0116 coton) |
| ★ Mines-métallurgie-sidérurgie | 05, 07, 08, 099, 24, 25 |
| ★ Hydrocarbures-pétrochimie-raffinage | 06, 091, 19 (+ 4661, 4730, 4930, 5210) |
| ★ Chimie-pharmacie | 20, 21 |
| ★ Énergie | 35 |
| ★ Numérique | 26 (+ 61, 62, 63) |
| Matériaux de construction et BTP | 23, 41, 42, 43 |
| Caoutchouc et plastiques | 22 |
| Papier, carton et imprimerie | 17, 18 |
| Équipements, machines et matériels de transport | 27, 28, 29, 30, 33 |
| Eau, assainissement et déchets | 36, 37, 38, 39 |
| Autres industries manufacturières | 32 |

Points à arbitrer avec le MINMIDT : rattachement du ciment (2394) à « Matériaux » plutôt qu'à
« Mines-métallurgie » (comme dans le fichier MINMIDT) ; inclusion du BTP (section F) ; 9e filière SND30.

## Mise à jour en production

`npm run db:deploy` (lancé par le build Render) charge ces référentiels de façon idempotente, puis rattache
les entreprises existantes à une filière d'après leur ancien secteur en texte libre. Les fiches restent
« activité non codée » jusqu'à ce qu'un administrateur choisisse leur code (bandeau dans la page Entreprises).

## Grandes industries (fichier MINMIDT)

`scripts/nomenclature/classer-ge-gi.py` propose un code CITI pour les 194 grandes industries de la feuille
GE-GI, avec un niveau de confiance (haute 91, moyenne 77, basse 26) et une remarque quand le classement
diffère du fichier. Le résultat (`local-test/data/classement-ge-gi-brouillon.csv`) n'est pas versionné : il
contient des données d'entreprises et doit être validé avant tout import en production.
