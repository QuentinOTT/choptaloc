const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Récupérer tous les messages de contact
router.get('/', async (req, res) => {
  try {
    const [messages] = await pool.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    res.json(messages);
  } catch (error) {
    console.error('Erreur récupération messages:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// Marquer un message comme lu
router.put('/:id/read', async (req, res) => {
  try {
    await pool.query(
      'UPDATE contact_messages SET is_read = TRUE WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour message:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du message' });
  }
});

// Créer un nouveau message de contact
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const [result] = await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message, is_read) VALUES (?, ?, ?, ?, ?, FALSE)',
      [name, email, phone, subject, message]
    );

    res.status(201).json({ success: true, messageId: result.insertId });
  } catch (error) {
    console.error('Erreur création message:', error);
    res.status(500).json({ error: 'Erreur lors de la création du message' });
  }
});

module.exports = router;
