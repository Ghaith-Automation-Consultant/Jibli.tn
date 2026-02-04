# Spécification Fonctionnelle : Page Détails de la Demande

## 1. Vue d'ensemble
La page "Détails de la Demande" (`demande.html`) permet à un utilisateur (voyageur potentiel) de consulter les besoins spécifiques d'un expéditeur (objet, poids, reward) afin de proposer de transporter l'objet.

## 2. Objectifs
- Présenter clairement l'objet à transporter et la récompense associée.
- Faciliter la mise en relation sécurisée.
- Clarifier la logistique (lieux, dates).

## 3. Structure de la Page

### 3.1. En-tête (Header)
- **Titre** : Objet demandé (ex: "Médicaments", "Documents").
- **Trajet** : Ville de retrait (ou "Acheter à...") → Ville de livraison.
- **Urgence** : Date limite de livraison.

### 3.2. Informations Demandeur
- **Carte Utilisateur** : Avatar, Nom, Note, Ancienneté.
- **Lien Profil** : Vers le profil public du demandeur.

### 3.3. Détails de l'Objet
- **Description** : Texte libre détaillant le besoin (marques, références, conditionnement).
- **Caractéristiques** :
    - Poids estimé (kg).
    - Dimensions/Volume (si précisé).
    - Valeur déclarée (optionnel, pour assurance).
- **Images** : Carrousel de photos de l'objet (si fournies).

### 3.4. Conditions & Récompense
- **Budget/Reward** : Montant proposé pour le service (ex: 20€).
- **Achat requis ?** : Oui/Non (Si Oui, le voyageur doit avancer les frais de l'objet).

### 3.5. Panneau d'Actions (Sticky Sidebar)
- **Bouton Principal "Proposer un trajet"** :
    - Si l'utilisateur a déjà un voyage compatible : "Lier à mon voyage Paris->Tunis".
    - Sinon : "Créer un voyage pour cette demande".
- **Bouton "Contacter"** : Messagerie directe pour questions.
- **Bouton "Sauvegarder"**.

## 4. Interactions & Règles de Gestion

### 4.1. Flux "Proposer un trajet"
1. Clic sur le bouton.
2. Vérification Auth.
3. Modal :
    - Liste des voyages futurs de l'utilisateur qui correspondent (Même trajet).
    - Option "Créer un nouveau voyage".
4. Sélection -> Envoi d'une "Proposition" (Notification au demandeur).

### 4.2. Flux "Achat pour autrui"
- Si l'objet doit être acheté, afficher un avertissement de sécurité : "Conservez toujours le ticket de caisse. Le remboursement se fait à la remise en main propre via Jibli Secure (futur) ou Cash."

## 5. Données Techniques
- **Source** : `GET /api/requests/:id`.
- **Champs clés** : `item`, `description`, `from` (optional), `to`, `beforeDate`, `weight`, `budget`, `buyItem` (bool), `images` [url].
