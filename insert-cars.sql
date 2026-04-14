-- Script pour insérer les véhicules dans la base de données existante
-- Exécuter ce script sur votre VPS : docker exec -i choptaloc-mysql mysql -u u643472395_datachoptaloc -pChoptaloc2026$! u643472395_datachoptaloc < insert-cars.sql

-- Supprimer les véhicules existants (optionnel - décommenter si vous voulez recréer)
-- DELETE FROM cars WHERE id IN (1, 2, 3, 4);

-- Insérer les véhicules (INSERT IGNORE pour éviter les doublons)
INSERT IGNORE INTO cars (brand, model, tag, price_per_day, image_url, specs, description, is_available) VALUES
('Mercedes', 'Classe A', 'Élégante & Compacte', 89.00, '/assets/Mercedesbachée.png',
 '["136 ch", "Automatique", "5 places", "Diesel"]',
 'La Mercedes Classe A allie élégance et technologie dans un format compact. Idéale pour la ville et les longs trajets, elle offre un confort exceptionnel et des équipements haut de gamme.',
 TRUE),
('Volkswagen', 'Golf 8 R', 'Sportive & Puissante', 129.00, '/assets/goldbachée.png',
 '["320 ch", "DSG 7", "5 places", "Essence"]',
 'La Golf 8 R est une véritable sportive compacte. Avec son moteur 320 ch et sa transmission intégrale, elle offre des performances exceptionnelles tout en restant polyvalente au quotidien.',
 FALSE),
('Audi', 'RS3', 'Haute Performance', 189.00, '/assets/Rs3bachée.png',
 '["400 ch", "S-Tronic", "5 places", "Essence"]',
 'L''Audi RS3 représente le summum de la performance dans la catégorie compacte. Son moteur 5 cylindres de 400 ch et sa transmission S-Tronic en font une machine de guerre absolue.',
 FALSE),
('Renault', 'Clio V', 'Pratique & Moderne', 49.00, '/assets/ClioVbleu.png',
 '["100 ch", "Manuelle", "5 places", "Essence"]',
 'La Clio V est le choix parfait pour ceux qui recherchent une voiture moderne, économique et bien équipée. Polyvalente et facile à conduire, elle s''adapte à toutes les situations.',
 TRUE);
