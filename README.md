# Jibli.tn - Plateforme de Crowd-Shipping

**Jibli.tn** est une plateforme communautaire connectant des voyageurs disposant d'espace libre dans leurs bagages avec des personnes souhaitant envoyer des colis (documents, médicaments, électronique, vêtements, etc.) vers une destination spécifique (ex: Paris → Tunis).

## 🚀 Fonctionnalités Principales

*   **Recherche de Voyages** : Trouver un voyageur pour transporter un colis.
    *   Filtres dynamiques : Départ/Arrivée, Date, Type (Gratuit/Payant), Poids max.
*   **Recherche de Demandes** : Trouver des objets à transporter pour rentabiliser son voyage.
*   **Affichage Dynamique** : Les résultats sont chargés depuis le backend via API.
*   **Authentification** : Inscription/connexion (Argon2id, cookies HttpOnly, refresh tokens rotatifs), changement de mot de passe.
*   **Publication** : Poster un voyage ou une demande.
*   **Messagerie** : Discussions entre utilisateurs.

## 🛠 Stack Technique

*   **Application** : Next.js 16 (App Router) + React 19, Tailwind CSS — pages dans `app/`, API dans `app/api/`.
*   **Persistance** : MongoDB (Mongoose ODM), modèles partagés dans `backend/models/`.
*   **Icons** : lucide-react.
*   **Legacy** : l'ancien serveur Express (`server.js`, `backend/routes`, `pages/*.html`, `js/`) est conservé pendant la migration ; c'est lui que couvrent les tests Jest.

## 🏃 Comment Lancer le Projet

### Prérequis
*   Node.js installé (v18+).
*   MongoDB installé et lancé (ou URI MongoDB Atlas).

### Installation
1.  Ouvrir un terminal dans le dossier racine `Jibli.tn code`.
2.  Configurer les variables d'environnement :
    ```bash
    cp .env.example .env
    # Modifier .env avec votre MONGO_URI
    ```
3.  Installer les dépendances :
    ```bash
    npm install
    ```
4.  (Optionnel) Initialiser la base de données — **attention : vide d'abord toutes les collections** de la base désignée par `MONGO_URI` :
    ```bash
    npm run seed
    ```
    Comptes de test : `karim@test.com`, `leila@test.com`, … mot de passe `Test@123456789`.

> **Sécurité** : `JWT_SECRET` doit être une valeur aléatoire propre à chaque environnement (ne réutilisez pas celle de `.env.example`). L'application refuse de démarrer en production sans `JWT_SECRET`.

### Démarrage
*   Développement : `npm run dev` → [http://localhost:3000](http://localhost:3000)
*   Production : `npm run build` puis `npm run start:next`
*   Ancienne version Express (legacy) : `npm start`

---

## 🧪 Tests Automatisés

Le projet dispose d'une suite de tests complète avec un taux de réussite de **100% (97/97 tests passés)**.

Les tests d'intégration backend sont entièrement autonomes et s'exécutent sur une instance de base de données MongoDB en mémoire (`mongodb-memory-server`). Cela signifie que **vous n'avez pas besoin d'installer ou de démarrer un serveur MongoDB local** pour exécuter les tests.

### Lancer tous les tests
```bash
npm test
```

### Lancer les tests E2E (application Next.js + API)
```bash
npm run test:e2e
```
Playwright compile l'application et la lance sur le port 3100 avec une base MongoDB en mémoire remplie par `backend/seed.js` : aucune base réelle n'est touchée. Navigateur requis : `npx playwright install chromium`.

### Générer le rapport de couverture
```bash
npm run test:coverage
```

---

## 📚 Documentation technique

*   [Conception du système](docs/tech/system-design.md) : architecture, API, sessions, modèle de données, sécurité.
*   [Plan d'amélioration](docs/tech/improvement-plan.md) : priorités P0–P3.

## 📂 Structure du Projet

```
/
├── backend/                # Logique serveur et données
│   ├── controllers/        # Contrôleurs API (Auth, Trips, Requests)
│   ├── middleware/         # Middlewares (Auth JWT, Validation)
│   ├── routes/             # Routes Express
│   ├── models/             # Modèles Mongoose (User, Trip, Request)
│   ├── config/             # Configuration DB
│   └── seed.js             # Script de peuplement DB
├── tests/                  # Suite de tests automatisés
│   ├── e2e/                # Tests Playwright
│   ├── integration/        # Tests Supertest
│   └── setup.js            # Configuration globale tests
├── docs/                   # Documentation du projet
│   ├── project-overview.md # Vue d'ensemble
│   ├── architecture.md     # Architecture technique
│   ├── roadmap.md          # Vision produit
│   └── ...                 # Autres docs techniques
├── pages/                  # Pages HTML du site
├── js/                     # Scripts JavaScript Frontend
├── server.js               # Point d'entrée du serveur Node.js
└── ...
```
