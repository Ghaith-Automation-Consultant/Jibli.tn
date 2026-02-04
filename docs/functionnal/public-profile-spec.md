# Spécification Fonctionnelle : Profil Public

## 1. Vue d'ensemble
Le Profil Public (`public-profile.html` ou `profile.html?id=:id`) est la vitrine de confiance d'un utilisateur. Contrairement au profil privé, il ne permet pas l'édition et masque les données sensibles.

## 2. Objectifs
- Prouver la fiabilité (Vérifications, Avis).
- Permettre de voir l'historique d'activité publique.

## 3. Structure de la Page

### 3.1. En-tête Public
- **Photo & Identité** : Avatar grand format, Prénom (Nom masqué ou initiale selon privacy), Date d'inscription.
- **Badges de Confiance** (Lecture seule) :
    - Email Vérifié.
    - Téléphone Vérifié (Oui/Non).
    - Identité Vérifiée (Badge Gold/Blue).

### 3.2. Statistiques
- Taux de réponse.
- Nombre de voyages effectués / Demandes satisfaites.
- Note moyenne globale.

### 3.3. Contenu (Onglets simplifiés)

#### A. À propos
- Bio utilisateur.
- Langues parlées.
- Ville de résidence.

#### B. Avis (Reviews)
- Liste des avis reçus (Voyageur et Expéditeur confondus ou filtrables).
- Pas de bouton "Répondre" (sauf si c'est mon propre profil public).

#### C. Annonces en cours
- **Voyages à venir** : Cartes des voyages futurs (cliquables vers `voyage.html`).
- **Demandes actives** : Cartes des demandes en cours.

## 4. Règles de Confidentialité (Privacy)
- **Téléphone / Email** : JAMAIS affichés publiquement.
- **Accessibilité** :
    - Ces données ne sont partagées que lorsqu'une transaction est **confirmée** entre les deux parties (Demande acceptée).
- **Nom de famille** : Option d'affichage (Ex: "Mohamed B." par défaut).

## 5. Aspects Techniques
- **API** : `GET /api/users/:id`.
- **Backend logic** : Le contrôleur doit filtrer automatiquement les champs sensibles (`email`, `phone`, `password`, `balance`) si le `requester.id !== target.id`.
