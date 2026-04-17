const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Ajouter un document
router.post('/', async (req, res) => {
  try {
    const { userId, type, fileData, fileName, status, rejectionReason } = req.body;

    const [result] = await pool.query(
      'INSERT INTO user_documents (user_id, document_type, file_path, file_name, is_verified) VALUES (?, ?, ?, ?, ?)',
      [userId, type, fileData, fileName, false]
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
      SELECT d.*, u.first_name, u.last_name, u.email 
      FROM user_documents d 
      LEFT JOIN users u ON d.user_id = u.id 
      ORDER BY d.created_at DESC
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
      'SELECT * FROM user_documents WHERE user_id = ? ORDER BY created_at DESC',
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
    const isVerified = status === 'verified';

    await pool.query(
      'UPDATE user_documents SET is_verified = ?, rejection_reason = ? WHERE id = ?',
      [isVerified, isVerified ? null : rejectionReason, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour statut document:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

module.exports = router;
