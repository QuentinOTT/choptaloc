const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend depuis le dossier frontend/dist
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Routes API
app.use('/api/users', require('./routes/users'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/cars', require('./routes/cars'));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API ChopTaLoc fonctionne' });
});

// Route SPA : servir index.html pour toutes les routes non-API
app.get('*', (req, res) => {
  // Si c'est une route API, ne pas rediriger
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Route API non trouvée' });
    return;
  }
  // Sinon, servir index.html pour le SPA
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur ChopTaLoc démarré sur le port ${PORT}`);
  console.log(`📁 Frontend servi depuis ../frontend/dist`);
  console.log(`🔌 API disponible sur /api/*`);
});
