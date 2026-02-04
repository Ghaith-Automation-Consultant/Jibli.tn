# Jibli.tn - Plateforme de Crowd-Shipping

**Jibli.tn** est une plateforme communautaire connectant des voyageurs disposant d'espace libre dans leurs bagages avec des personnes souhaitant envoyer des colis (documents, médicaments, électronique, vêtements, etc.) vers une destination spécifique (ex: Paris → Tunis).

## 🚀 Fonctionnalités Principales

*   **Recherche de Voyages** : Trouver un voyageur pour transporter un colis.
    *   Filtres dynamiques : Départ/Arrivée, Date, Type (Gratuit/Payant), Poids max.
*   **Recherche de Demandes** : Trouver des objets à transporter pour rentabiliser son voyage.
*   **Affichage Dynamique** : Les résultats sont chargés depuis le backend via API.
*   **Authentification** : Système de Login/Inscription (Simulé).
*   **Publication** : Poster un voyage ou une demande.

## 🛠 Stack Technique

*   **Frontend** : HTML5, Tailwind CSS, Vanilla JS.
*   **Backend** : Node.js, Express.js.
*   **Persistance** : MongoDB (Mongoose ODM).
*   **Icons** : FontAwesome 5.15.
*   **Fonts** : Cairo & Inter (Google Fonts).

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
4.  (Optionnel) Initialiser la base de données :
    ```bash
    npm run seed
    ```

### Démarrage
1.  Lancer le serveur Backend :
    ```bash
    npm start
    ```
    *Le serveur démarrera sur http://localhost:3000*
2.  Accéder à l'application dans votre navigateur :
    *   Accueil : [http://localhost:3000/index.html](http://localhost:3000/index.html)
    *   Recherche : [http://localhost:3000/recherche.html](http://localhost:3000/recherche.html)

> **Note** : Le frontend est servi statiquement par le serveur Express.

---

## 🧪 Tests Automatisés

Le projet dispose d'une suite de tests complète (~88% success rate).

### Lancer tous les tests
```bash
npm test
```

### Lancer les tests E2E (UI)
```bash
npm run test:e2e
```

### Générer le rapport de couverture
```bash
npm run test:coverage
```

---

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
