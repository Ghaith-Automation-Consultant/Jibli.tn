# Feuille de Route - Jibli.tn

Cette feuille de route détaille les étapes concrètes pour la réalisation de la plateforme Jibli.tn, de la structuration à la mise en production.

## Phase 1 : Consolidation & Design (Semaines 1-2)
*Objectif : Mettre en place les bases visuelles et la structure du projet.*

- [ ] **Structuration des Dossiers** :
    - Créer les dossiers `assets/`, `css/`, `js/`, `pages/` comme défini dans le README.
    - Déplacer les fichiers existants (`Jibli.tn.png`, HTML files) dans les bons répertoires.
- [ ] **Application de la Charte Graphique** :
    - Finaliser `Template.html` en intégrant les couleurs et fonts de `Graphical_chart.json`.
    - Créer un fichier `layout.css` (ou config Tailwind) partageable pour éviter la duplication des styles.
- [ ] **Mockups Complémentaires** :
    - Créer la maquette HTML pour la page "Détail d'un voyage".
    - Créer la maquette HTML pour la page "Publier une annonce".

## Phase 2 : Développement Frontend (Semaines 3-4)
*Objectif : Rendre les interactions fonctionnelles (côté client).*

- [ ] **Affichage Dynamique** :
    - Extraire les données mockées (voyages, demandes) dans un fichier JSON ou JS séparé.
    - Créer un script `render.js` pour générer les cartes de résultats dynamiquement au lieu du HTML statique.
- [ ] **Navigation & Routeur** :
    - Implementer une navigation fluide entre Accueil, Recherche et Détails sans rechargement complet (SPA simple ou liens classiques optimisés).
- [ ] **Filtres de Recherche** :
    - Coder la logique JavaScript pour filtrer les résultats en temps réel (par prix, date, poids) comme esquissé dans `Page recherche.html`.

## Phase 3 : Backend & Authentification (Semaines 5-6)
*Objectif : Persistance des données et gestion utilisateurs.*

- [ ] **API Backend** :
    - Mettre en place un serveur (Node.js/Express ou Python/Django ou Firebase).
    - Créer les endpoints : `GET /trips`, `POST /trip`, `GET /users`.
- [ ] **Authentification** :
    - Créer les pages Login / Inscription (HTML).
    - Intégrer la logique d'auth (JWT ou Session).
- [ ] **Base de Données** :
    - Modéliser la BDD (Users, Trips, Requests, Messages).

## Phase 4 : Fonctionnalités Avancées (Semaine 7+)
*Objectif : Enrichir l'expérience utilisateur.*

- [ ] **Messagerie** :
    - Implémenter le chat en temps réel entre Expéditeur et Voyageur.
- [ ] **Géolocalisation** :
    - Intégrer une carte interactive réelle (Google Maps API ou Leaflet) dans la page Recherche.
- [ ] **Système de Notation** :
    - Permettre de laisser un avis (étoiles + commentaire) après une transaction.

## Phase 5 : Tests & Déploiement
- [ ] **Tests Utilisateurs** : Vérifier le parcours complet (Recherche -> Contact -> Validation).
- [ ] **Optimisation** : Minifier CSS/JS, optimiser les images.
- [ ] **Déploiement** : Mettre en ligne sur un hébergeur (Vercel, Netlify, ou VPS).
