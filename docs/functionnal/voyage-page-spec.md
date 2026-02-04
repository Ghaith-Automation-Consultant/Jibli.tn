# Spécification Fonctionnelle : Page Détails du Voyage

## 1. Vue d'ensemble
La page "Détails du Voyage" (`voyage.html`) affiche les informations complètes d'une annonce de transport pour permettre au visiteur de prendre une décision et d'initier un contact avec le voyageur.

## 2. Objectifs
- Présenter clairement l'itinéraire, les dates, la capacité et les conditions.
- Rassurer sur la fiabilité du voyageur.
- Faciliter la mise en relation (Contact) ou la sauvegarde de l'annonce.

## 3. Structure de la Page

### 3.1. En-tête (Header)
- **Localisation** : Ville de départ → Ville d'arrivée (Gros titre).
- **Badge de statut** : "Voyage vérifié", "Complet", ou "Passé".
- **Dates & Heures** : Date de départ et d'arrivée estimée.

### 3.2. Informations Voyageur
- **Carte Voyageur** :
    - Avatar, Nom.
    - Note moyenne et nombre d'avis.
    - Badges (Membre depuis...).
- **Actions Voyageur** :
    - Bouton **"Voir le profil"** : Redirige vers la page publique du profil (`profile.html?id=:userId`).

### 3.3. Détails Logistiques
- **Capacité** : Poids disponible (kg) et Taille acceptée (S/M/L).
- **Conditions Financières** : Gratuit ou Prix par kg.
- **Objets Acceptés** : Liste des catégories (ex: Documents, Vêtements).
- **Description** : Texte libre rédigé par le voyageur.

### 3.4. Carte
- Visuel statique ou interactif du trajet.

### 3.5. Panneau d'Actions (Sticky Sidebar)
- **Bouton Principal "Contacter [Prénom]"** : 
    - Ouvre une modale de messagerie ou redirige vers la messagerie avec le contexte du voyage pré-rempli.
    - Si non connecté : Ouvre la modale de connexion.
- **Bouton "Sauvegarder" (Favori)** :
    - Ajoute le voyage à la liste de favoris locale ou compte utilisateur.
    - Changement d'état visuel (Cœur plein/vide).
- **Bouton "Partager"** :
    - Ouvre la boîte de dialogue de partage native du navigateur ou copie le lien dans le presse-papier via `navigator.clipboard`.

## 4. Interactions & Règles de Gestion

### 4.1. Navigation Profil
- Le clic sur "Voir le profil" doit charger les données publiques de l'utilisateur associé au voyage.

### 4.2. Flux de Contact
1. Clic sur "Contacter".
2. Vérification: Utilisateur connecté ?
    - Non -> `showLoginModal()`.
    - Oui -> `openMessageModal(recipientId, tripId)` ou redirection `dashboard.html?tab=messages&new=recipientId`.

### 4.3. Gestion des Favoris
- Stockage : `localStorage` pour les invités, Base de données pour les connectés (futur).
- Feedback immédiat : Toast "Voyage sauvegardé".

## 5. Données Techniques
- **Source** : `JibliData.trips` (via `data.js` ou API `GET /api/trips/:id`).
- **Champs requis** : `from`, `to`, `date`, `user` object (id, name, avatar, rating), `capacity`, `price`, `description`.
