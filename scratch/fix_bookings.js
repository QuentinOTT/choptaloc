const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', 'server', '.env') });

async function fixBookings() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Rendre la date de permis optionnelle...');
    await connection.query('ALTER TABLE bookings MODIFY COLUMN driver_license_date DATE NULL');
    console.log('Succès !');
  } catch (e) {
    console.error('Erreur:', e.message);
  } finally {
    await connection.end();
  }
}

fixBookings();
