# Jeux de Données et Scénarios de Test

Ce document décrit les jeux de données injectés dans la base de données (`backend/seed.js`) afin de simuler des cas d'utilisation réels pour le développement et la démonstration.

## 1. Utilisateurs (Personas)

| Nom | Email | Mot de passe | Rôle / Profil | Localisation |
| :--- | :--- | :--- | :--- | :--- |
| **Karim Voyageur** | `karim@test.com` | `Test@123456789` | **Voyageur Fréquent** (Vérifié). Fait souvent la navette Lyon-Tunis. | Lyon, FR |
| **Leila Urgent** | `leila@test.com` | `Test@123456789` | **Expéditeur "Besoin Urgent"**. Cherche souvent des médicaments ou pièces. | Tunis, TN |
| **Sami Etudiant** | `sami@test.com` | `Test@123456789` | **Étudiant / Budget Serré**. Cherche des trajets gratuits/solidaires. | Paris, FR |
| **Alice Martin** | `alice@test.com` | `Test@123456789` | **Utilisateur Standard**. Utilisation occasionnelle. | Marseille, FR |
| **Moncef Pro** | `moncef@test.com` | `Test@123456789` | **Transporteur Professionnel**. Effectue des livraisons de haute valeur avec garantie. | Paris, FR |
| **Nour Artisanat** | `nour@test.com` | `Test@123456789` | **Petite Commerçante**. Envoie régulièrement des produits locaux vers l'Europe. | Sousse, TN |

## 2. Scénarios (Use Cases)

### Scénario A : Négociation pour un bien sensible (Médicaments)
*   **Contexte** : Leila a besoin de médicaments cardiaques introuvables à Tunis pour son père.
*   **Action** : Elle a contacté Karim qui a un voyage prévu Lyon -> Tunis.
*   **Données** :
    *   **Voyage** : Lyon -> Tunis (Dans 5 jours), 23kg dispo.
    *   **Demande** : "Médicaments Cardiaques", Urgente.
    *   **Messages** : Un fil de discussion existe déjà où Karim demande l'ordonnance.
*   **Test à faire** : Se connecter en tant que Leila (`leila@test.com`) pour voir la notification de réponse, ou Karim (`karim@test.com`) pour répondre.

### Scénario B : Solidarité Étudiante
*   **Contexte** : Sami rentre à Sfax et propose de prendre de petits objets gratuitement pour aider.
*   **Données** :
    *   **Voyage** : Paris -> Sfax (Dans 10 jours), Gratuit, Max 5kg.
    *   **Demande** : Sami cherche aussi des "Livres Scolaires" sur Paris.

### Scénario C : Le Voyageur Rentable
*   **Contexte** : Karim veut rentabiliser son retour Tunis -> Lyon.
*   **Données** :
    *   **Voyage** : Tunis -> Lyon (Dans 20 jours), Payant (15€/kg).

### Scénario D : Transport Sécurisé (Haute Valeur)
*   **Contexte** : Alice veut envoyer un ordinateur portable très cher (MacBook) à sa famille à Tunis en toute sécurité.
*   **Action** : Elle confie l'objet à Moncef, un voyageur professionnel très bien évalué.
*   **Données** :
    *   **Voyage** : Paris -> Tunis (Dans 15 jours), Transport de valeur sécurisé (25€/kg).
    *   **Demande** : "MacBook Pro", Envoi fragile et précieux, 2.5kg.

### Scénario E : Export d'Artisanat Local
*   **Contexte** : Nour vend des produits d'artisanat tunisiens et a besoin d'envoyer une commande importante en France.
*   **Données** :
    *   **Voyage** : Sousse -> Paris (Dans 7 jours), 30kg dispo.
    *   **Demande** : "Tapis et Céramiques Traditionnels", Encombrant (15kg).

## 3. Données Techniques

### Voyages (Trips)
1.  **Lyon -> Tunis** (Karim) : Actif, Payant, Lourd (23kg).
2.  **Tunis -> Lyon** (Karim) : Actif, Payant, Moyen (10kg).
3.  **Paris -> Sfax** (Sami) : Actif, Gratuit, Léger (5kg).
4.  **Marseille -> Tunis** (Alice) : **Terminé** (Passé), servira pour l'historique.
5.  **Paris -> Tunis** (Moncef) : Actif, Sécurisé/Garantie, Standard (50kg).
6.  **Sousse -> Paris** (Nour) : Actif, Commercial, Lourd (30kg).

### Demandes (Requests)
1.  **Médicaments** (Leila) : Tunis, Urgent.
2.  **Livres Scolaires** (Sami) : Paris, Standard.
3.  **Parfum** (Alice) : Marseille, Standard.
4.  **PC Portable MacBook** (Alice) : Paris, Fragile/Valeur.
5.  **Tapis et Céramiques** (Nour) : Sousse, Encombrant.

## 4. Instructions de Mise à jour
Pour réinitialiser la base de données avec ces données :
1.  Ouvrir un terminal dans `backend/`.
2.  Lancer : `node seed.js`
3.  Vérifier que "Data Seeding Completed Successfully" s'affiche.
