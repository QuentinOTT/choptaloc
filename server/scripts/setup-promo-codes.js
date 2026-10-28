// À exécuter sur le serveur, avec son environnement DB, après une sauvegarde.
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();
const pool = require('../config/database');

async function main() {
  const backup = process.argv[2];
  if (!backup || !fs.existsSync(backup) || fs.statSync(backup).size < 100) throw new Error('Indiquez le chemin de la sauvegarde SQL de cette base.');
  const meta = JSON.parse(fs.readFileSync(`${backup}.json`, 'utf8'));
  const hash = crypto.createHash('sha256').update(fs.readFileSync(backup)).digest('hex');
  if (meta.host !== process.env.DB_HOST || meta.database !== process.env.DB_NAME || meta.sha256 !== hash) throw new Error('La sauvegarde ne correspond pas à la connexion courante ou son intégrité est invalide.');
  await pool.query(`CREATE TABLE IF NOT EXISTS promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percentage','fixed') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INT NULL,
    current_uses INT NOT NULL DEFAULT 0,
    valid_from TIMESTAMP NULL,
    valid_until TIMESTAMP NULL,
    min_booking_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  const [columns] = await pool.query('SHOW COLUMNS FROM promo_codes');
  if (!columns.some(column => column.Field === 'car_id')) {
    await pool.query('ALTER TABLE promo_codes ADD COLUMN car_id INT NULL AFTER id');
  }
  console.log('Table promo_codes disponible. Aucune table existante ni donnée supprimée.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
