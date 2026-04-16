-- ============================================
-- BASE DE DONNÉES CHOPTALOC
-- Système de réservation de véhicules
-- ============================================

-- 1. TABLE DES UTILISATEURS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- 2. TABLE DES VÉHICULES
CREATE TABLE cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    tag VARCHAR(255),
    price_per_day DECIMAL(10, 2) NOT NULL,
    weekend_price DECIMAL(10, 2),
    weekly_price DECIMAL(10, 2),
    monthly_price DECIMAL(10, 2),
    image_url VARCHAR(500),
    specs JSON,
    description TEXT,
    features JSON,
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. TABLE DES DISPONIBILITÉS
CREATE TABLE availabilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    UNIQUE KEY unique_car_date (car_id, date)
);

-- 4. TABLE DES RÉSERVATIONS
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    pickup_time TIME DEFAULT '10:00:00',
    dropoff_time TIME DEFAULT '10:00:00',
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    driver_license_number VARCHAR(50),
    driver_license_date DATE NOT NULL,
    driver_license_expiry DATE,
    confirmation_number VARCHAR(20) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

-- 5. TABLE DES PAIEMENTS
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('credit_card', 'paypal', 'bank_transfer', 'cash') NOT NULL,
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 6. TABLE DES OPTIONS/SERVICES
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLE DES OPTIONS DE RÉSERVATION
CREATE TABLE booking_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- 8. TABLE DES AVIS CLIENTS
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    booking_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- 9. TABLE DES MESSAGES DE CONTACT
CREATE TABLE contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. TABLE DES PARAMÈTRES DU SITE
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 11. TABLE DES DOCUMENTS UTILISATEURS
CREATE TABLE user_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    document_type ENUM('id_card_front', 'id_card_back', 'license_front', 'license_back', 'proof_of_address') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path LONGTEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    file_hash VARCHAR(255), -- Pour vérifier l'intégrité
    encryption_key VARCHAR(255), -- Clé de chiffrement (stockée de manière sécurisée)
    is_encrypted BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_at TIMESTAMP NULL,
    expiry_date DATE, -- Pour justificatif de domicile (-1 mois)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 12. TABLE DES SESSIONS DE STOCKAGE
CREATE TABLE storage_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. TABLE DES LOGS D'ACCÈS AUX DOCUMENTS
CREATE TABLE document_access_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    accessed_by INT NOT NULL,
    access_type ENUM('upload', 'view', 'download', 'delete') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES user_documents(id) ON DELETE CASCADE,
    FOREIGN KEY (accessed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. TABLE DES PROFILS CLIENTS
CREATE TABLE user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    country VARCHAR(100) DEFAULT 'France',
    date_of_birth DATE,
    preferred_payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 15. TABLE DES DEMANDES DE MODIFICATION
CREATE TABLE modification_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    requested_by INT NOT NULL,
    changes JSON NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Insérer un administrateur par défaut (seulement s'il n'existe pas déjà)
INSERT IGNORE INTO users (email, password_hash, first_name, last_name, role) 
VALUES ('admin@choptaloc.com', '$2b$10$YourHashedPasswordHere', 'Admin', 'Choptaloc', 'admin');

-- Insérer les véhicules existants
INSERT INTO cars (brand, model, tag, price_per_day, image_url, specs, description, is_available) VALUES
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
('Renault', 'Clio V Esprit Alpine', '145 CV - Hybride - 2023', 70.00, 250.00, 390.00, 1190.00, '/assets/ClioVbleu.png',
 '["145 ch", "Automatique", "5 places", "Hybride"]',
 'La Renault Clio V en finition Esprit Alpine allie modernité, sportivité et efficience hybride. Parfaite pour tous vos trajets avec son moteur de 145 ch et sa finition haut de gamme.',
 TRUE);

-- Insérer les services disponibles
INSERT INTO services (name, description, price) VALUES
('Chauffeur privé', 'Service de chauffeur professionnel disponible 24h/24', 50.00),
('Livraison à domicile', 'Livraison du véhicule à votre adresse', 30.00),
('Assurance tous risques', 'Couverture complète sans franchise', 25.00),
('Kilométrage illimité', 'Pas de limite de kilomètres', 20.00),
('Siège bébé', 'Siège bébé homologué', 10.00),
('GPS intégré', 'Système de navigation GPS', 5.00);

-- Insérer les paramètres par défaut
INSERT INTO settings (key_name, value, description) VALUES
('site_name', 'ChopTaLoc', 'Nom du site'),
('site_email', 'contact@choptaloc.com', 'Email de contact'),
('site_phone', '+33 1 23 45 67 89', 'Téléphone de contact'),
('min_rental_days', '1', 'Nombre minimum de jours de location'),
('max_rental_days', '30', 'Nombre maximum de jours de location'),
('deposit_amount', '500', 'Montant du dépôt de garantie en euros');

-- ============================================
-- INDEX POUR OPTIMISATION
-- ============================================

-- Index sur les tables fréquemment interrogées
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_car_id ON bookings(car_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_availabilities_car_id ON availabilities(car_id);
CREATE INDEX idx_availabilities_date ON availabilities(date);
CREATE INDEX idx_reviews_car_id ON reviews(car_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
