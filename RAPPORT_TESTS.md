# Eventia — Rapport de tests de bout en bout

*2026-08-04 — 33/33 tests exécutés réellement (API + navigateur), 1 bug critique trouvé et corrigé.*

## Bug critique trouvé et corrigé

**Réinitialisation de mot de passe cassée pour 100% des utilisateurs réels.**

`POST /auth/reset-password` comparait le champ `confirmerMotDePasse` au texte
littéral `"nouveauMotDePasse"` (`@Equals('nouveauMotDePasse')`) au lieu de le
comparer à la valeur du champ `nouveauMotDePasse`. Aucun utilisateur réel ne
pouvait donc jamais réinitialiser son mot de passe.

Corrigé dans `src/auth/dto/reset-password.dto.ts` et `src/auth/auth.controller.ts`
(Eventia-App) : la comparaison se fait maintenant explicitement dans le contrôleur.
Testé avec mots de passe identiques (succès) et différents (rejet propre en 400).

## Authentification

| Test | Méthode | Résultat |
|---|---|---|
| Inscription client | `POST /auth/inscription-client` | ✅ |
| Inscription organisateur | `POST /auth/inscription-organisateur` | ✅ |
| Connexion (les deux rôles) | `POST /auth/connexion` | ✅ |
| Mot de passe oublié — envoi du code | `POST /auth/forgot-password` | ✅ |
| Vérification du code | `POST /utilisateur/verify-reset-code` | ✅ |
| Réinitialisation — mots de passe identiques | `POST /auth/reset-password` | ✅ (corrigé) |
| Réinitialisation — rejet si différents | `POST /auth/reset-password` | ✅ 400 propre |
| Connexion avec le nouveau mot de passe | `POST /auth/connexion` | ✅ |
| Changement de mot de passe (connecté) | `PATCH /utilisateur/me/change-password` | ✅ |
| Déconnexion | `POST /auth/deconnexion` | ✅ |
| Client axios attache le token JWT | intercepteur global | ✅ (corrigé plus tôt) |

## Parcours public — découverte & réservation

| Test | Résultat |
|---|---|
| Landing page — aucune erreur console | ✅ |
| Liste des événements publiés (`/events`) | ✅ |
| Recherche depuis le Hero → filtre sur `/events?q=` | ✅ |
| Fiche événement — infos réelles | ✅ |
| Réservation — 1 billet | ✅ code généré |
| Réservation — 3 billets en une commande | ✅ 3 codes uniques |

## Espace organisateur

| Test | Résultat |
|---|---|
| Connexion → dashboard reflète la vraie réservation | ✅ revenus/acheteurs/billets exacts |
| Création d'événement — validation des champs requis | ✅ |
| Recherche de lieu (OpenStreetMap réel) | ✅ suggestion avec coordonnées |
| Modification d'un événement existant | ✅ persiste après rechargement |
| Scan de billet — code valide | ✅ "Billet validé" |
| Journal d'accès — reflète le scan | ✅ |
| Détail événement — stats exactes après scan | ✅ vendus/restants/revenus/taux |

## Espace administrateur

| Test | Résultat |
|---|---|
| Liste des utilisateurs (API réelle) | ✅ |
| Dashboard — utilisateurs réels + événements/billets/revenus calculés | ✅ tous les chiffres vérifiés exacts |
| Modération — valider un événement en attente | ✅ statut change et persiste |
| Finances plateforme — revenus/commission/reversement | ✅ calcul vérifié (27 500 → 2 750 → 24 750) |
| Rapports | ✅ affiche l'état "bientôt disponible" |
| Paramètres — changement de mot de passe | ✅ |

## Build & déploiement

| Test | Résultat |
|---|---|
| Build production web (`vite build`) | ✅ sans erreur |
| Commit + push Eventia-web (branche gedeon) | ✅ origin + numerum |
| Commit + push Eventia-App (branches dev + gedeon) | ✅ origin + numerum |
| Base de données nettoyée des comptes de test | ✅ |
