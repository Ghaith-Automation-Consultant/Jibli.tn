# Spécification Fonctionnelle : Messagerie

## 1. Vue d'ensemble
La messagerie est le canal de communication central entre Voyageurs et Expéditeurs. Elle doit permettre de négocier les détails (lieu de RDV, prix, photos colis) en temps réel ou asynchrone.

## 2. Objectifs
- Centraliser les échanges.
- Sécuriser les transactions (garder les preuves de discussion).
- Notifier les utilisateurs.

## 3. Structure de l'Interface

### 3.1. Liste des Conversations (Sidebar / Page Index sur Mobile)
- Liste chronologique inversée.
- **Item de liste** :
    - Avatar interlocuteur.
    - Nom (+ Badge "Voyageur" ou "Expéditeur" selon le contexte).
    - Extrait du dernier message.
    - Timestamp (12:30 ou Hier).
    - Indicateur "Non lu" (Pastille).

### 3.2. Fenêtre de Chat (Main View)
- **Header Contextuel** :
    - Nom de l'interlocuteur.
    - **Contexte du sujet** : "Voyage Paris -> Tunis (12/05)" ou "Demande : Médicaments".
    - Bouton d'action rapide : "Voir l'annonce".
- **Zone de Messages** :
    - Bulles (Bubbles) : Moi (droite), Autre (gauche).
    - Status : Envoyé, Remis, Lu (√√).
    - Support multimédia (futur) : Photos du colis.
- **Input Area** :
    - Champ texte.
    - Bouton Envoyer.

## 4. Intégration

### 4.1. Desktop (`dashboard.html?tab=messages`)
- Vue Split : Liste à gauche (30%), Chat à droite (70%).
- Si aucune conversation sélectionnée : Placeholder "Commencez une discussion".

### 4.2. Mobile (`messages.html` ou Vue Adaptative)
- **Vue Liste** : Plein écran. Clic -> Ouvre Vue Chat.
- **Vue Chat** : Plein écran avec bouton "Retour".

## 5. Règles de Gestion
- **Initiation** : Une conversation ne peut être initiée que depuis une Annonce (Bouton "Contacter").
- **Blocage** : Un utilisateur peut bloquer un autre membre (Stop messages).
- **Modération** : Détection de mots clés (ex: "Western Union", insultes) -> Warning automatique ou masquage.

## 6. Aspects Techniques
- **API** :
    - `GET /api/messages` : Liste des threads.
    - `GET /api/messages/:userId` : Historique avec un user.
    - `POST /api/messages` : Envoi.
- **Temps Réel** :
    - V1 : Polling (toutes les 10s).
    - V2 : Socket.io / WebSocket.
