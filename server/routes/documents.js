const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Ajouter un document
router.post('/', async (req, res) => {
  try {
    const { userId, type, fileData, fileName, status, rejectionReason } = req.body;

    const [result] = await pool.query(
      'INSERT INTO documents (userId, type, fileData, fileName, status, rejectionReason) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, type, fileData, fileName, status || 'pending', rejectionReason || null]
    );

    res.status(201).json({ success: true, documentId: result.insertId });
  } catch (error) {
    console.error('Erreur ajout document:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du document' });
  }
});

// Récupérer tous les documents
router.get('/', async (req, res) => {
  try {
    const [documents] = await pool.query(`
      SELECT d.*, u.firstName, u.lastName, u.email 
      FROM documents d 
      LEFT JOIN users u ON d.userId = u.id 
      ORDER BY d.createdAt DESC
    `);
    res.json(documents);
  } catch (error) {
    console.error('Erreur récupération documents:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
});

// Récupérer les documents d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const [documents] = await pool.query(
      'SELECT * FROM documents WHERE userId = ? ORDER BY createdAt DESC',
      [req.params.userId]
    );
    res.json(documents);
  } catch (error) {
    console.error('Erreur récupération documents utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des documents' });
  }
});

// Mettre à jour le statut d'un document
router.put('/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    await pool.query(
      'UPDATE documents SET status = ?, rejectionReason = ? WHERE id = ?',
      [status, rejectionReason || null, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour statut document:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

module.exports = router;
