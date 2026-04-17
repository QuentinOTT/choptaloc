const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Récupérer tous les réglages
router.get('/', async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT * FROM settings');
    // Convertir en objet pour plus de facilité côté frontend
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key_name] = s.value;
    });
    res.json(settingsObj);
  } catch (error) {
    console.error('Erreur récupération réglages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réglages' });
  }
});

// Mettre à jour un réglage ou plusieurs
router.post('/batch', async (req, res) => {
  try {
    const settings = req.body; // Objet { key: value }
    
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
        [key, value.toString(), value.toString()]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour réglages:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des réglages' });
  }
});

module.exports = router;
