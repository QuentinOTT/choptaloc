const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

async function fixUserConstraint() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root_password',
    database: 'u643472395_datachoptaloc',
    port: 3307
  });

  try {
    console.log('Rendre le user_id optionnel dans les réservations...');
    await connection.query('ALTER TABLE bookings MODIFY COLUMN user_id INT NULL');
    console.log('Succès !');
  } catch (e) {
    console.error('Erreur:', e.message);
  } finally {
    await connection.end();
  }
}

fixUserConstraint();
