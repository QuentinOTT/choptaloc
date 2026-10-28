const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const pool = require('./config/database');

// Ajout uniquement de la table des codes promo si elle manque. Les tables et
// les lignes existantes ne sont jamais réinitialisées par ce démarrage.
async function ensurePromoCodesTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INT NULL,
    current_uses INT NOT NULL DEFAULT 0,
    valid_from TIMESTAMP NULL,
    valid_until TIMESTAMP NULL,
    min_booking_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  const [promoColumns] = await pool.query('SHOW COLUMNS FROM promo_codes');
  if (!promoColumns.some(column => column.Field === 'car_id')) {
    await pool.query('ALTER TABLE promo_codes ADD COLUMN car_id INT NULL AFTER id');
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes API
const apiRouter = express.Router();
apiRouter.use('/users', require('./routes/users'));
apiRouter.use('/bookings', require('./routes/bookings'));
apiRouter.use('/documents', require('./routes/documents'));
apiRouter.use('/cars', require('./routes/cars'));
apiRouter.use('/contact', require('./routes/contact'));
apiRouter.use('/settings', require('./routes/settings'));
apiRouter.use('/promo-codes', require('./routes/promoCodes'));

// Définir les routes de santé et racine sur le router API aussi
apiRouter.get('/health', (req, res) => res.json({ status: 'ok', message: 'API healthy' }));

// Monter le router API
app.use('/api', apiRouter);
// Fallback pour la racine du serveur
app.get('/', (req, res) => res.json({ status: 'ok', message: 'API ChopTaLoc Root' }));

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
async function start() {
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await ensurePromoCodesTable();
      break;
    } catch (error) {
      if (attempt === 10 || ['ER_DBACCESS_DENIED_ERROR', 'ER_TABLEACCESS_DENIED_ERROR', 'ER_SPECIFIC_ACCESS_DENIED_ERROR'].includes(error.code)) {
        console.error('Création de promo_codes impossible ; les autres fonctions restent disponibles :', error.message);
        break;
      }
      console.warn(`Base indisponible au démarrage (${attempt}/10) :`, error.message);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur API ChopTaLoc démarré sur le port ${PORT}`);
    console.log(`🔌 API disponible sur /api/*`);
  });
}
start().catch(error => console.error('Erreur au démarrage :', error));
