const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./config/database');

// Migration automatique de la base de données
async function runMigrations() {
  try {
    const [columns] = await pool.query('SHOW COLUMNS FROM cars');
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('weekend_price')) {
      await pool.query('ALTER TABLE cars ADD COLUMN weekend_price DECIMAL(10, 2)');
      console.log('✅ Migration: Ajout colonne weekend_price');
    }
    if (!columnNames.includes('weekly_price')) {
      await pool.query('ALTER TABLE cars ADD COLUMN weekly_price DECIMAL(10, 2)');
      console.log('✅ Migration: Ajout colonne weekly_price');
    }
    if (!columnNames.includes('monthly_price')) {
      await pool.query('ALTER TABLE cars ADD COLUMN monthly_price DECIMAL(10, 2)');
      console.log('✅ Migration: Ajout colonne monthly_price');
    }

    const [userColumns] = await pool.query('SHOW COLUMNS FROM users');
    const userColNames = userColumns.map(c => c.Field);
    if (!userColNames.includes('is_verified')) {
      await pool.query('ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE');
      console.log('✅ Migration: Ajout colonne is_verified sur users');
    }

    // Mise à jour de l''enum pour les documents
    try {
      await pool.query("ALTER TABLE user_documents MODIFY COLUMN document_type ENUM('id_card_front', 'id_card_back', 'license_front', 'license_back', 'proof_of_address', 'other') NOT NULL");
      console.log('✅ Migration: Mise à jour enum document_type');
    } catch (e) {
      console.warn('⚠️ Note Migration Enum:', e.message);
    }
  } catch (error) {
    console.warn('⚠️ Note Migration:', error.message);
  }
}
runMigrations();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes API
app.use('/api/users', require('./routes/users'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/cars', require('./routes/cars'));
app.use('/api/contact', require('./routes/contact'));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API ChopTaLoc fonctionne' });
});

// Route racine
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API ChopTaLoc' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur API ChopTaLoc démarré sur le port ${PORT}`);
  console.log(`🔌 API disponible sur /api/*`);
});
