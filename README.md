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
*   **Persistance** : JSON File Store (prototype).
*   **Icons** : FontAwesome 5.15.
*   **Fonts** : Cairo & Inter (Google Fonts).

## 🏃 Comment Lancer le Projet

### Prérequis
*   Node.js installé.

### Installation
1.  Ouvrir un terminal dans le dossier racine `Jibli.tn code`.
2.  Installer les dépendances :
    ```bash
    npm install
    ```

### Démarrage
1.  Lancer le serveur Backend :
    ```bash
    node server.js
    ```
    *Le serveur démarrera sur http://localhost:3000*
2.  Accéder à l'application dans votre navigateur :
    *   Accueil : [http://localhost:3000/template.html](http://localhost:3000/template.html)
    *   Recherche : [http://localhost:3000/recherche.html](http://localhost:3000/recherche.html)

> **Note** : Le frontend est servi statiquement par le serveur Express. Vous devez passer par `localhost:3000` pour que les appels API fonctionnent (pas d'ouverture directe des fichiers HTML).

## 📂 Structure du Projet

```
/
├── backend/                # Logique serveur et données
│   ├── db.js               # Gestionnaire de base de données (fichier JSON)
│   └── data.json           # Stockage des données (Voyages, Demandes)
├── pages/                  # Pages HTML du site
│   ├── template.html       # Page d'Accueil
│   ├── recherche.html      # Page de Recherche
│   ├── voyage.html         # Détail d'un voyage
│   └── poster-annonce.html # Formulaires de publication
├── js/                     # Scripts JavaScript Frontend
│   ├── main.js             # Logique globale (navigation, auth, modals)
│   ├── recherche.js        # Logique de filtrage et recherche
│   ├── data.js             # Client API (fetch wrappers)
│   └── render.js           # Génération dynamique du HTML (cartes)
├── css/                    # Styles personnalisés
├── assets/                 # Images et logos
├── server.js               # Point d'entrée du serveur Node.js
└── graphical_chart.json    # Charte graphique (Couleurs, Fonts)
```
