-- ============================================
-- MISE À JOUR DE LA BASE DE DONNÉES CHOPTALOC
-- Exécutez ce script pour ajouter les nouveaux champs
-- ============================================

-- Mise à jour de la table bookings
ALTER TABLE bookings 
ADD COLUMN pickup_time TIME DEFAULT '10:00:00' AFTER end_date,
ADD COLUMN dropoff_time TIME DEFAULT '10:00:00' AFTER pickup_time,
ADD COLUMN payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending' AFTER status,
ADD COLUMN driver_license_date DATE NOT NULL AFTER driver_license_number,
ADD COLUMN confirmation_number VARCHAR(20) UNIQUE AFTER driver_license_expiry;

-- Note: Si la table bookings existe déjà avec des données,
-- vous devrez peut-être d'abord mettre à jour les enregistrements existants
-- pour le nouveau champ driver_license_date (NOT NULL)

-- Pour les données existantes, vous pouvez exécuter :
-- UPDATE bookings SET driver_license_date = '2000-01-01' WHERE driver_license_date IS NULL;

-- Mise à jour des disponibilités des voitures (seulement si aucune voiture n'est disponible)
UPDATE cars SET is_available = 1 WHERE is_available = 0 AND (SELECT COUNT(*) FROM cars WHERE is_available = 1) = 0;
