const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root_password',
    database: 'u643472395_datachoptaloc',
    port: 3307
  });

  console.log('Connexion réussie. Début de la migration...');

  try {
    // 1. Ajout des colonnes pour la caution et le permis
    try {
      await connection.query('ALTER TABLE cars ADD COLUMN caution_amount DECIMAL(10, 2) DEFAULT 1000');
      console.log('Colonne caution_amount ajoutée.');
    } catch (e) { console.log('caution_amount existe déjà ou erreur:', e.message); }

    try {
      await connection.query('ALTER TABLE cars ADD COLUMN min_license_years INT DEFAULT 2');
      console.log('Colonne min_license_years ajoutée.');
    } catch (e) { console.log('min_license_years existe déjà ou erreur:', e.message); }

    // 2. Rendre la date de permis optionnelle
    try {
      await connection.query('ALTER TABLE bookings MODIFY COLUMN driver_license_date DATE NULL');
      console.log('Colonne driver_license_date rendue optionnelle.');
    } catch (e) { console.log('Erreur sur bookings:', e.message); }

    // 3. Mise à jour de la Clio V
    const clioSpecs = JSON.stringify(["145 cv", "Automatique", "5 places", "Hybride"]);
    await connection.query(
      'UPDATE cars SET specs = ?, model = "Clio V Esprit Alpine", tag = "145 CV - Hybride - 2023" WHERE id = 4 OR (brand = "Renault" AND model LIKE "Clio%")',
      [clioSpecs]
    );
    console.log('Données de la Clio V mises à jour en base.');

  } catch (error) {
    console.error('Erreur pendant la migration:', error);
  } finally {
    await connection.end();
    console.log('Migration terminée.');
  }
}

migrate();
