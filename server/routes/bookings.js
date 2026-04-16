const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Créer une réservation
router.post('/', async (req, res) => {
  try {
    const { carId, userId, startDate, endDate, pickupLocation, returnLocation, totalPrice, notes, driverLicenseNumber, driverLicenseDate } = req.body;

    const [result] = await pool.query(
      'INSERT INTO bookings (car_id, user_id, start_date, end_date, pickup_location, dropoff_location, total_price, notes, status, driver_license_number, driver_license_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pending", ?, ?)',
      [carId, userId, startDate, endDate, pickupLocation, returnLocation, totalPrice, notes, driverLicenseNumber || null, driverLicenseDate || null]
    );

    res.status(201).json({ success: true, bookingId: result.insertId });
  } catch (error) {
    console.error('Erreur création réservation:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la réservation' });
  }
});

// Récupérer toutes les réservations (avec pagination)
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM bookings');

    const [bookings] = await pool.query(`
      SELECT b.*, u.first_name, u.last_name, u.email, c.brand, c.model 
      FROM bookings b 
      LEFT JOIN users u ON b.user_id = u.id 
      LEFT JOIN cars c ON b.car_id = c.id 
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json({
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });
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
      LEFT JOIN cars c ON b.car_id = c.id 
      WHERE b.user_id = ? 
      ORDER BY b.created_at DESC
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

// Mettre à jour une réservation (champs variés)
router.put('/:id', async (req, res) => {
  try {
    const fields = req.body;
    const allowedFields = ['start_date', 'end_date', 'pickup_location', 'dropoff_location', 'total_price', 'status', 'notes', 'driver_license_number', 'driver_license_date', 'pickup_time', 'dropoff_time'];
    
    // Mapper les noms camelCase du frontend vers snake_case de la DB si nécessaire
    const mappedFields = {};
    Object.keys(fields).forEach(key => {
      const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(dbKey)) {
        mappedFields[dbKey] = fields[key];
      } else if (allowedFields.includes(key)) {
        mappedFields[key] = fields[key];
      }
    });

    if (Object.keys(mappedFields).length === 0) {
      return res.status(400).json({ error: 'Aucun champ valide à mettre à jour' });
    }

    const setClause = Object.keys(mappedFields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(mappedFields);
    values.push(req.params.id);

    await pool.query(
      `UPDATE bookings SET ${setClause} WHERE id = ?`,
      values
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour réservation:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la réservation' });
  }
});

// Créer une demande de modification
router.post('/:id/modifications', async (req, res) => {
  try {
    const { changes, requestedBy } = req.body;

    const [result] = await pool.query(
      'INSERT INTO modification_requests (booking_id, requested_by, changes, status) VALUES (?, ?, ?, "pending")',
      [req.params.id, requestedBy, JSON.stringify(changes)]
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
      SELECT mr.*, b.id as booking_id, u.first_name, u.last_name 
      FROM modification_requests mr 
      LEFT JOIN bookings b ON mr.booking_id = b.id 
      LEFT JOIN users u ON mr.requested_by = u.id 
      ORDER BY mr.created_at DESC
    `);
    
    // Parser les changements JSON si nécessaire
    const parsedModifications = modifications.map(m => ({
      ...m,
      changes: typeof m.changes === 'string' ? JSON.parse(m.changes) : m.changes
    }));

    res.json(parsedModifications);
  } catch (error) {
    console.error('Erreur récupération modifications:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des modifications' });
  }
});

// Mettre à jour le statut d'une demande de modification
router.put('/modifications/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    await pool.query(
      'UPDATE modification_requests SET status = ?, rejection_reason = ? WHERE id = ?',
      [status, rejectionReason || null, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour statut modification:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// Récupérer les demandes de modification d'un utilisateur
router.get('/modifications/user/:userId', async (req, res) => {
  try {
    const [modifications] = await pool.query(`
      SELECT mr.*, b.status as booking_status, c.brand, c.model 
      FROM modification_requests mr 
      LEFT JOIN bookings b ON mr.booking_id = b.id 
      LEFT JOIN cars c ON b.car_id = c.id 
      WHERE mr.requested_by = ? 
      ORDER BY mr.created_at DESC
    `, [req.params.userId]);
    
    // Parser les changements JSON si nécessaire
    const parsedModifications = modifications.map(m => ({
      ...m,
      changes: typeof m.changes === 'string' ? JSON.parse(m.changes) : m.changes
    }));

    res.json(parsedModifications);
  } catch (error) {
    console.error('Erreur récupération modifications utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des modifications' });
  }
});

// Supprimer une réservation
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression réservation:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la réservation' });
  }
});

module.exports = router;
