# Spécification Fonctionnelle : Page Profil Utilisateur

## 1. Vue d'ensemble
La page profil est le centre de gestion de l'identité et de la réputation de l'utilisateur sur Jibli.tn. Elle doit inspirer confiance aux autres membres (aspect critique pour une plateforme peer-to-peer) et permettre à l'utilisateur de gérer ses informations personnelles, ses préférences et sa sécurité.

## 2. Objectifs
- **Renforcer la confiance** : Afficher clairement les éléments de vérification (email, téléphone, identité) et la réputation (avis).
- **Gestion Autonome** : Permettre à l'utilisateur de modifier ses informations sans support.
- **Sécurité** : Gestion du mot de passe et des sessions.

## 3. Structure de la Page

### 3.1. En-tête de Profil (Header)
Zone visible publiquement (et en mode édition pour l'utilisateur).
- **Photo de Profil** :
    - Affichage circulaire.
    - Bouton "Modifier" (upload image avec recadrage automatique ou validation taille/format).
- **Informations Identitaires** :
    - Prénom et Nom (ou Pseudo selon confidentialité).
    - Date d'inscription ("Membre depuis le...").
    - **Badges de Vérification** :
        - ✅ Email vérifié
        - ✅ Téléphone vérifié (futur)
        - ✅ Identité vérifiée (CNI/Passeport - futur)
- **Indicateur de Réputation** :
    - Note globale (ex: 4.8/5).
    - Nombre d'avis reçus.
    - Lien vers "Voir tous les avis".

### 3.2. Onglets de Navigation Interne
La page est divisée en sous-sections pour une meilleure lisibilité.

#### A. Onglet "Informations Personnelles" (Par défaut)
Formulaire permettant la modification des données.
- **Champs** :
    - Nom complet (Editable, peut nécessiter re-vérification si changement majeur).
    - Email (Lecture seule ou procédure de changement avec validation).
    - Numéro de téléphone (Avec indicateur de pays +216, +33, etc.).
    - Ville de résidence principale.
    - Bio / Présentation : Courte description (ex: "Étudiant à Paris, je rentre souvent à Tunis").
- **Langues parlées** : Sélecteur multiple (Français, Arabe, Anglais...).

#### B. Onglet "Sécurité & Connexion"
- **Changement de mot de passe** :
    - Ancien mot de passe.
    - Nouveau mot de passe + Confirmation.
- **Double Authentification (2FA)** (Feature avancée) : Toggle pour activer/désactiver.
- **Gestion des Sessions** (Feature avancée) :
    - Liste des appareils connectés.
    - Bouton "Déconnecter tous les autres appareils".
- **Suppression de compte** : Zone de danger avec confirmation explicite.

#### C. Onglet "Vérifications & Confiance"
Section dédiée à augmenter le niveau de confiance du profil.
- **État des vérifications** : Liste visuelle (Fait / À faire).
    - **Email** (Obligatoire) : Vérifié à l'inscription. Badge vert.
    - **Téléphone** :
        - Bouton **"Ajouter"** : Ouvre une modale de saisie du numéro -> Envoi OTP (Simulation pour MVP).
        - État : Non vérifié (Gris) -> Vérifié (Vert) après validation.
    - **Pièce d'identité** :
        - Bouton **"Vérifier"** : Ouvre une modale d'upload sécurisé (Recto/Verso).
        - État : En attente de validation (Orange) -> Validé (Vert).
    - **Réseaux sociaux** : Lier un compte Facebook/LinkedIn (Preuve sociale).

#### D. Onglet "Avis & Évaluations"
Historique de la réputation.
- **En tant que Voyageur** : Avis laissés par les expéditeurs.
- **En tant qu'Expéditeur** : Avis laissés par les voyageurs.
- Chaque avis comprend : Note, Commentaire, Auteur, Date, Réponse (droit de réponse du propriétaire du profil).

#### E. Onglet "Préférences & Notifications"
- **Notifications Email** :
    - Nouveaux messages.
    - Rappels de voyage.
    - Newsletter.
- **Notifications Push/SMS** (si applicable).
- **Devise préférée** : TND / EUR (pour l'affichage des prix).

## 4. Interactions & Règles de Gestion

### 4.1. Mode Consultation (Public)
Lorsqu'un autre utilisateur visite ce profil (via un voyage ou une demande).
- Accès restreint : Photo, Nom, Bio, Badges, Avis, Langues.
- **Masqué** : Email, Téléphone (sauf si trajet confirmé/accepté), Onglets Sécurité/Préférences.
- Bouton : "Contacter" (Ouvre la messagerie).

### 4.2. Mode Édition (Propriétaire)
- Validation des formulaires en temps réel.
- Toast de confirmation ("Profil mis à jour avec succès").
- Gestion des erreurs (ex: "Cet email est déjà utilisé").

## 5. Aspects Techniques

### 5.1. API Endpoints Nécessaires
- `GET /api/users/me` : Récupère toutes les infos privées (pour le propriétaire).
- `GET /api/users/:id` : Récupère les infos publiques (pour les visiteurs).
- `PUT /api/users/me` : Met à jour les infos de base.
- `PUT /api/users/me/password` : Change le mot de passe.
- `POST /api/users/me/avatar` : Upload de photo.

### 5.2. Modèle de Données (Mises à jour requises)
Le modèle User actuel devra être enrichi :
- `bio` (String)
- `phone` (String)
- `languages` (Array of Strings)
- `isEmailVerified` (Boolean)
- `isPhoneVerified` (Boolean)
- `isIdentityVerified` (Boolean)
- `reviews` (Array of sub-documents ou Ref vers modèle Review)

## 6. Maquettes (Wireframe Rapide)
*(Layout suggéré : Sidebar à gauche pour les onglets sur Desktop, Menu horizontal défilant sur Mobile)*

```
+-------------------------------------------------------+
|  [Photo]  Prénom Nom  [Badge Vérifié]                 |
|           "Bio courte..."                             |
|           ⭐ 4.8 (12 avis)                            |
+-------------------------------------------------------+
| [Infos Perso] [Sécurité] [Vérifications] [Avis]       |
+-------------------------------------------------------+
|                                                       |
|  Nom: [ _____________ ]                               |
|  Téléphone: [ _____________ ] [Vérifier]              |
|  Ville: [ _____________ ]                             |
|                                                       |
|  [ Sauvegarder ]                                      |
|                                                       |
+-------------------------------------------------------+
```
