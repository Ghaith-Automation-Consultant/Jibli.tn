# Plan de Migration vers un Monorepo Next.js

> **Statut (2026-11) :** la migration a été faite sous forme d'une seule application Next.js à la racine
> (sans Turborepo) ; le code Express reste à retirer. Voir [system-design.md](system-design.md) et la
> recommandation P1-2 de [improvement-plan.md](improvement-plan.md).

Ce document décrit la stratégie et les étapes nécessaires pour migrer l'application Jibli.tn (actuellement en base de code avec Node.js/Express en backend et HTML/Vanilla JS en frontend) vers une architecture **Monorepo basée sur Next.js**.

## 1. Architecture Cible

L'objectif est d'unifier le projet dans un environnement monorepo moderne et évolutif.

*   **Gestionnaire de Monorepo** : [Turborepo](https://turbo.build/) couplé avec `pnpm` workspaces (ou `npm`/`yarn` workspaces).
*   **Framework Fullstack** : **Next.js** (App Router).
    *   Les pages HTML et le JS vanilla deviendront des composants React (Server Components par défaut).
    *   Les routes Express deviendront des API Routes Next.js (`app/api/...`) ou utiliseront les Server Actions.
*   **Base de Données** : Conservation de **MongoDB** et **Mongoose**. Modèles extraits dans un package partagé.
*   **Style** : Conservation de **Tailwind CSS**.
*   **Tests** : Conservation de Jest et Playwright, réadaptés au monorepo.
*   **Typage (Optionnel mais recommandé)** : Introduction progressive de TypeScript.

---

## 2. Structure du Monorepo

La nouvelle structure du projet devrait ressembler à ceci :

```text
/
├── apps/
│   ├── web/                     # Application Next.js (Frontend UI + Backend API Routes)
│   └── legacy/                  # L'ancienne application (conservée temporairement pour référence)
├── packages/
│   ├── database/                # Logique MongoDB, schémas Mongoose, scripts de seed
│   ├── ui/                      # Composants React partagés (boutons, inputs, layout originel de Jibli)
│   ├── config-tailwind/         # Configuration partagée de Tailwind CSS
│   ├── config-eslint/           # Règles de linting
│   └── config-typescript/       # (Optionnel) Configuration TS
├── turbo.json                   # Configuration de build et de cache de Turborepo
├── package.json                 # Dépendances root du workspace
└── pnpm-workspace.yaml          # Configuration du monorepo (si utilisation de pnpm)
```

---

## 3. Stratégie de Migration (Approche par Phases)

La migration se fera de manière itérative afin de garantir le bon fonctionnement continu.

### Phase 1 : Initialisation du Monorepo et Infrastructure

1.  **Création du workspace** : Initialisation de Turborepo à la racine du projet.
2.  **Déplacement du code existant** : Déplacer le code actuel (frontend et backend express) vers `apps/legacy`.
3.  **Bootstrapping de Next.js** : Générer l'application Next.js vierge dans `apps/web`.
4.  **Création des packages** : Initialiser `packages/database` et `packages/ui`.
5.  **Configuration des outils partagés** : Mettre en place Tailwind, ESLint, et Prettier pour le workspace.

### Phase 2 : Migration de la Base de Données et du Modèle de Données

1.  **Extraction de Mongoose** : Copier le dossier `backend/models` et `backend/config` vers `packages/database`.
2.  **Connexion Serverless** : Adapter la connexion MongoDB (`db.js`) pour qu'elle réutilise les connexions en cache dans un environnement serverless (évite l'épuisement du pool de connexions lors des "cold starts" de Next.js).
3.  **Exportation** : Exporter les modèles depuis `packages/database` pour qu'ils soient consommables par `apps/web`.

### Phase 3 : Migration du Backend (Express vers Next.js API Routes/Actions)

1.  **Routes API** : Recréer les anciens endpoints Express (`/api/trips`, `/api/requests`, `/api/auth`) dans le dossier `apps/web/app/api/`.
2.  **Middlewares** : 
    *   Remplacer l'authentification JWT d'Express par une logique compatible Next.js.
    *   Mettre en œuvre le Next.js Middleware (`middleware.ts` à la racine de `apps/web`) pour protéger les routes API et les pages nécessitant une authentification.
3.  **Tests API** : Migrer et adapter les tests unitaires / d'intégration (Jest/Supertest) pour valider le comportement de la nouvelle logique backend.

### Phase 4 : Migration du Frontend (Vanilla/HTML vers React/Next.js)

1.  **Mise en place de Tailwind** : Assurer que Tailwind lit correctement les classes dans `apps/web` et `packages/ui`.
2.  **Composantisation** : Convertir progressivement les éléments HTML bruts de `pages/` en composants React dans `packages/ui` (NavBar, Footer, TripCard, RequestCard).
3.  **Pages (App Router)** : 
    *   Migrer `index.html` vers `apps/web/app/page.tsx`.
    *   Migrer `recherche.html` vers `apps/web/app/recherche/page.tsx`, etc.
4.  **État et Logique (Vanilla JS vers Hooks)** :
    *   Remplacer les appels `fetch` vanilla par des "Server Components" pour la récupération directe des données de la BDD lors des rendus côté serveur (idéal pour le SEO et les performances).
    *   Utiliser les hooks (`useState`, `useEffect` ou SWR/React Query) pour l'interactivité côté client.

### Phase 5 : Tests E2E, Déploiement et Cut-over

1.  **Adaptation de Playwright** : Pointer les tests Playwright vers le serveur de test de Next.js (port 3000) et s'assurer que tous les flux E2E (login, recherche de voyage) passent correctement.
2.  **Configuration CI/CD** : Ajuster les pipelines GitHub Actions pour tirer parti du cache Turborepo (`turbo run build test lint`).
3.  **Déploiement** : Déployer l'application fédérée sur une plateforme comme Vercel, Render ou un conteneur Docker.
4.  **Cut-over final** : Une fois le nouveau système 100% opérationnel, supprimer définitivement `apps/legacy`.

---

## 4. Risques et Points de Vigilance

*   **Connexions DB en Serverless** : Les fonctions Next.js peuvent créer de multiples connexions MongoDB. Il est crucial d'utiliser un cache global en développement.
*   **Authentication Flow** : Le passage des cookies Express natifs ou localStorage vers la gestion des cookies sécurisés avec Next.js demande une attention particulière sur la sécurité (ex: utilisation de `jose` ou `next-auth`).
*   **SEO** : Les balises meta doivent être proprement re-configurées avec l'API `generateMetadata` de Next.js.
*   **Courbe d'apprentissage** : La refonte entraîne un passage radical de Vanilla JS au paradigme React Server Components.

---

## 5. Prochaines Étapes Immédiates

1.  Valider cette proposition d'architecture.
2.  Créer une branche `feature/monorepo-migration`.
3.  Lancer l'initialisation de Turborepo (`npx create-turbo@latest`).
