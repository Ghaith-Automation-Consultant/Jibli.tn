# Spécifications Fonctionnelles : Tableau de Bord Utilisateur (Dashboard)

## 1. Vue d'ensemble
Le Tableau de Bord (Dashboard) est le centre de contrôle personnel de l'utilisateur authentifié. Il permet de gérer l'ensemble de ses activités sur la plateforme : voyages publiés, demandes formulées, messages échangés et informations personnelles.

**URL** : `/dashboard.html`
**Accès** : Utilisateur authentifié uniquement (Redirection vers Login si non connecté).

---

## 2. Structure et Navigation
Le dashboard est structuré autour d'une barre latérale (ou barre de navigation supérieure sur mobile) permettant de basculer entre les différentes vues :

1.  **Vue d'ensemble (Overview)** : Résumé de l'activité.
2.  **Mes Voyages** : Gestion des annonces en tant que voyageur.
3.  **Mes Demandes** : Gestion des requêtes en tant qu'expéditeur.
4.  **Messagerie** : Conversations en cours.
5.  **Paramètres / Profil** : Gestion du compte.

---

## 3. Fonctionnalités Détaillées

### 3.1 Vue d'ensemble (Overview)
Cette section offre une vision synthétique de l'activité de l'utilisateur.

*   **Statistiques Rapides** :
    *   Nombre de voyages actifs.
    *   Nombre de demandes en cours.
    *   Messages non lus.
*   **Activité Récente** :
    *   Liste chronologique des dernières notifications ou actions (ex: "Karim vous a envoyé un message", "Votre voyage vers Tunis expire bientôt").
*   **Actions Rapides** :
    *   Bouton "Publier un voyage".
    *   Bouton "Faire une demande".

### 3.2 Mes Voyages
Gestion des trajets proposés par l'utilisateur.

*   **Liste des Voyages** : Affichage sous forme de cartes ou liste.
*   **Onglets de Filtre** : "À venir" (Actifs) / "Historique" (Passés/Archivés).
*   **Détails d'une carte Voyage** :
    *   Trajet (Ville départ ➝ Ville arrivée).
    *   Date et Heure.
    *   Capacité restante (Poids/Taille).
    *   Statut (Actif, Complet, Terminé).
*   **Actions disponibles** :
    *   **Modifier** : Ouvre un modal pré-rempli pour ajuster la date, le poids, etc.
    *   **Supprimer** : Annulation du voyage (avec confirmation).
    *   **Voir l'annonce** : Redirection vers la page publique du voyage.

### 3.3 Mes Demandes
Gestion des objets que l'utilisateur souhaite faire transporter.

*   **Liste des Demandes** : Affichage similaire aux voyages.
*   **Filtres** : "En attente" / "En cours" / "Livrées".
*   **Détails d'une carte Demande** :
    *   Objet et photo (si disponible).
    *   Trajet souhaité.
    *   Récompense proposée.
    *   État de la demande.
*   **Actions disponibles** :
    *   **Modifier** : Mise à jour des détails.
    *   **Supprimer** : Retrait de la demande.
    *   **Marquer comme trouvé / livré** : Change le statut de la demande une fois satisfaite.

### 3.4 Messagerie
Interface de communication intégrée (voir `messaging-spec.md` pour les détails techniques complets).

*   **Liste des conversations** : Triées par date de dernier message.
*   **Indicateurs** : Badge pour les messages non lus.
*   **Zone de chat** : Affichage de l'historique et envoi de nouveaux messages.
*   **Contexte** : Lien vers le voyage ou la demande concernée en haut de la conversation.

### 3.5 Paramètres / Profil
Lien vers la page d'édition du profil (voir `profile-page-spec.md`).

*   Accès rapide pour modifier :
    *   Photo de profil.
    *   Informations personnelles (Bio, Téléphone).
    *   Préférences de notification.
    *   Mot de passe.

---

## 4. Règles de Gestion et Comportement

*   **Persistance de la session** : L'utilisateur doit rester connecté s'il rafraîchit la page.
*   **Réactivité** : Les listes (voyages/demandes) doivent se mettre à jour immédiatement après une création, modification ou suppression, sans rechargement complet de la page (AJAX/Fetch).
*   **États vides (Empty States)** : Si l'utilisateur n'a pas de voyages ou de demandes, afficher une illustration conviviale et un bouton d'incitation à l'action ("Vous n'avez pas encore de voyage. Publiez-en un maintenant !").

## 5. Maquettes et UI

*   **Design** : Utilisation du système de design `TailwindCSS` existant (couleurs `primary` teal, `neutral` grays).
*   **Composants** : Réutilisation des cartes de voyage et de demande standardisées, mais avec des boutons d'édition supplémentaires (icônes Crayon/Poubelle) visibles uniquement par le propriétaire.

## 6. Flux de Création (Modals)
Le dashboard héberge les modals de création pour éviter de quitter la page :
*   `#createTripModal` : Formulaire de création de voyage.
*   `#createRequestModal` : Formulaire de création de demande.
Ces formulaires doivent comporter une validation côté client avant envoi.
