const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Créer une réservation
router.post('/', async (req, res) => {
  try {
    const { carId, userId, startDate, endDate, pickupLocation, returnLocation, delivery, pickupAddress, returnAddress, totalPrice, notes } = req.body;

    const [result] = await pool.query(
      'INSERT INTO bookings (carId, userId, startDate, endDate, pickupLocation, returnLocation, delivery, pickupAddress, returnAddress, totalPrice, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "pending")',
      [carId, userId, startDate, endDate, pickupLocation, returnLocation, delivery, pickupAddress, returnAddress, totalPrice, notes]
    );

    res.status(201).json({ success: true, bookingId: result.insertId });
  } catch (error) {
    console.error('Erreur création réservation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la réservation' });
  }
});

// Récupérer toutes les réservations
router.get('/', async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.*, u.firstName, u.lastName, u.email, c.brand, c.model 
      FROM bookings b 
      LEFT JOIN users u ON b.userId = u.id 
      LEFT JOIN cars c ON b.carId = c.id 
      ORDER BY b.createdAt DESC
    `);
    res.json(bookings);
  } catch (error) {
    console.error('Erreur récupération réservations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
  }
});

// Récupérer les réservations d'un utilisateur
router.get('/user/:userId', async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.*, c.brand, c.model 
      FROM bookings b 
      LEFT JOIN cars c ON b.carId = c.id 
      WHERE b.userId = ? 
      ORDER BY b.createdAt DESC
    `, [req.params.userId]);
    res.json(bookings);
  } catch (error) {
    console.error('Erreur récupération réservations utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
  }
});

// Mettre à jour le statut d'une réservation
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    await pool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour statut réservation:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// Créer une demande de modification
router.post('/:id/modifications', async (req, res) => {
  try {
    const { field, oldValue, newValue, reason } = req.body;

    const [result] = await pool.query(
      'INSERT INTO modification_requests (bookingId, field, oldValue, newValue, reason, status) VALUES (?, ?, ?, ?, ?, "pending")',
      [req.params.id, field, oldValue, newValue, reason]
    );

    res.status(201).json({ success: true, modificationId: result.insertId });
  } catch (error) {
    console.error('Erreur création demande modification:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la demande de modification' });
  }
});

// Récupérer toutes les demandes de modification
router.get('/modifications/all', async (req, res) => {
  try {
    const [modifications] = await pool.query(`
      SELECT mr.*, b.id as bookingId, u.firstName, u.lastName 
      FROM modification_requests mr 
      LEFT JOIN bookings b ON mr.bookingId = b.id 
      LEFT JOIN users u ON b.userId = u.id 
      ORDER BY mr.createdAt DESC
    `);
    res.json(modifications);
  } catch (error) {
    console.error('Erreur récupération modifications:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des modifications' });
  }
});

// Mettre à jour le statut d'une demande de modification
router.put('/modifications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    await pool.query(
      'UPDATE modification_requests SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour statut modification:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

module.exports = router;
