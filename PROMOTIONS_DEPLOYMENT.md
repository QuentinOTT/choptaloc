# Promotions Choptaloc

Le frontend Docker est construit avec `VITE_API_URL=/api`. Son Nginx transmet ces appels au backend Docker. Le serveur public doit déployer **frontend et backend ensemble** ; un frontend récent avec un backend ancien renvoie une erreur lors de la création d’un code.

Après le pull sur le serveur, reconstruire les services applicatifs sans supprimer les volumes MySQL. Le backend ajoute automatiquement **uniquement** la table `promo_codes` si elle manque (`CREATE TABLE IF NOT EXISTS`). Il ne modifie ni ne supprime les tables existantes. Les champs promotionnels des voitures doivent déjà exister, comme dans le schéma fourni.

La sauvegarde locale `backups/docker-local-2026-10-28.sql` concerne seulement MySQL Docker local. Pour une sauvegarde de la base du serveur, le script `server/scripts/backup-database.js` exporte les données avec `mysqldump` et écrit une empreinte SHA256. Les sauvegardes sont exclues de Git et des images Docker.

Dans l’administration, activer la promotion dans la fiche voiture, saisir par exemple `35` en pourcentage, puis enregistrer. Le formulaire relit la valeur sauvegardée par l’API et indique si un ancien backend ne l’a pas conservée. La page d’accueil et la présélection du calendrier affichent alors le prix réduit ; le backend recalcule le montant avant création de la réservation.
