const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Configuration Mailjet
const Mailjet = require('node-mailjet');
const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
});

// Fonction d'envoi de l'email de confirmation
async function sendBookingConfirmationEmail(bookingId, bookingData, carData, userData, type = 'pending') {
  try {
    if (!process.env.MJ_APIKEY_PUBLIC || !process.env.MJ_APIKEY_PRIVATE) {
      console.warn('⚠️ Mailjet non configuré, email de confirmation non envoyé');
      return;
    }

    // Calcul de la durée
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const duration = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));

    // Formater les dates en français
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Sélection du template ID
    const templateId = type === 'confirmed' ? 7976290 : 7976373;
    const subject = type === 'confirmed' 
      ? `✅ Réservation Confirmée #${bookingId} - ${carData.brand} ${carData.model}`
      : `⏳ Demande de réservation #${bookingId} - En attente`;

    const result = await mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: 'quentix05@gmail.com',
              Name: 'Choptaloc Service',
            },
            To: [
              {
                Email: userData.email,
                Name: `${userData.firstName} ${userData.lastName}`,
              },
            ],
            TemplateID: templateId,
            TemplateLanguage: true,
            Subject: subject,
            Variables: {
              first_name: userData.firstName || 'Client',
              booking_id: String(bookingId),
              vehicle_name: `${carData.brand} ${carData.model}`,
              vehicle_tag: carData.tag || 'Premium',
              start_date: formatDate(bookingData.startDate),
              end_date: formatDate(bookingData.endDate),
              duration: String(duration),
              pickup_time: bookingData.pickupTime || 'À convenir',
              dropoff_time: bookingData.dropoffTime || 'À convenir',
              pickup_location: bookingData.pickupLocation || 'Sur place',
              return_location: bookingData.returnLocation || 'Sur place',
              total_price: String(bookingData.totalPrice),
              caution_amount: carData.caution_amount ? String(carData.caution_amount) : '1000',
              company_phone: '07 68 00 13 47',
            },
          },
        ],
      });

    console.log(`✅ Email ${type} envoyé pour la réservation #${bookingId} à ${userData.email}`);
  } catch (err) {
    console.error(`❌ Erreur envoi email ${type} #${bookingId}:`, err.message || err);
  }
}

// Route d'urgence pour corriger le schéma de base de données en production
router.get('/fix-schema', async (req, res) => {
  try {
    const results = [];
    
    // 1. user_id optionnel
    try {
      await pool.query('ALTER TABLE bookings MODIFY COLUMN user_id INT NULL');
      results.push('user_id rendu optionnel');
    } catch (e) { results.push('Erreur user_id: ' + e.message); }

    // 2. champs optionnels bookings
    try {
      await pool.query('ALTER TABLE bookings MODIFY COLUMN driver_license_date DATE NULL');
      results.push('driver_license_date rendu optionnel');
    } catch (e) { results.push('Erreur date permis: ' + e.message); }

    try {
      await pool.query('ALTER TABLE bookings MODIFY COLUMN driver_license_number VARCHAR(255) NULL');
      results.push('driver_license_number rendu optionnel');
    } catch (e) { results.push('Erreur numéro permis: ' + e.message); }

    // 3. ajout colonnes cars
    try {
      await pool.query('ALTER TABLE cars ADD COLUMN caution_amount DECIMAL(10, 2) DEFAULT 1000');
      results.push('caution_amount ajoutée');
    } catch (e) { results.push('Erreur caution: ' + e.message); }

    try {
      await pool.query('ALTER TABLE cars ADD COLUMN min_license_years INT DEFAULT 2');
      results.push('min_license_years ajoutée');
    } catch (e) { results.push('Erreur min years: ' + e.message); }

    // 4. Clio V
    try {
      const clioSpecs = JSON.stringify(["145 cv", "Automatique", "5 places", "Hybride"]);
      await pool.query(
        'UPDATE cars SET specs = ?, model = "Clio V Esprit Alpine", tag = "145 CV - Hybride - 2023" WHERE id = 4 OR (brand = "Renault" AND model LIKE "Clio%")',
        [clioSpecs]
      );
      results.push('Clio V mise à jour');
    } catch (e) { results.push('Erreur clio: ' + e.message); }

    // 5. ajout is_admin_proposal
    try {
      await pool.query('ALTER TABLE modification_requests ADD COLUMN is_admin_proposal TINYINT(1) DEFAULT 0');
      results.push('is_admin_proposal ajoutée');
    } catch (e) { results.push('Erreur is_admin_proposal: ' + e.message); }

    res.json({ success: true, log: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer une réservation
router.post('/', async (req, res) => {
  try {
    const { carId, userId, startDate, endDate, pickupLocation, returnLocation, totalPrice, notes, driverLicenseNumber, driverLicenseDate } = req.body;

    const [result] = await pool.query(
      'INSERT INTO bookings (car_id, user_id, start_date, end_date, pickup_location, dropoff_location, total_price, notes, status, driver_license_number, driver_license_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "pending", ?, ?)',
      [
        carId, 
        userId, 
        startDate, 
        endDate, 
        pickupLocation, 
        returnLocation, 
        totalPrice, 
        notes, 
        driverLicenseNumber && driverLicenseNumber.trim() !== "" ? driverLicenseNumber : null, 
        driverLicenseDate && driverLicenseDate.trim() !== "" ? driverLicenseDate : null
      ]
    );

    const bookingId = result.insertId;

    // Envoi de l'email de confirmation (async, non-bloquant)
    if (userId) {
      try {
        // Récupérer les infos du client et du véhicule
        const [[user]] = await pool.query('SELECT first_name, last_name, email FROM users WHERE id = ?', [userId]);
        const [[car]] = await pool.query('SELECT brand, model, tag, caution_amount FROM cars WHERE id = ?', [carId]);

        if (user && user.email && car) {
          sendBookingConfirmationEmail(bookingId, req.body, car, user);
        }
      } catch (emailErr) {
        console.error('⚠️ Erreur récupération données email:', emailErr.message);
      }
    }

    res.status(201).json({ success: true, bookingId });
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
    const bookingId = req.params.id;

    await pool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, bookingId]
    );

    // Si confirmé, envoyer l'email de validation
    if (status === 'confirmed') {
      try {
        // Récupérer toutes les infos nécessaires
        const [rows] = await pool.query(`
          SELECT b.*, u.first_name, u.last_name, u.email, c.brand, c.model, c.tag, c.caution_amount 
          FROM bookings b
          JOIN users u ON b.user_id = u.id
          JOIN cars c ON b.car_id = c.id
          WHERE b.id = ?
        `, [bookingId]);
        
        if (rows.length > 0) {
          const data = rows[0];
          // Adapter format pour sendBookingConfirmationEmail
          const bookingData = {
            startDate: data.start_date,
            endDate: data.end_date,
            pickupTime: data.pickup_time,
            dropoffTime: data.dropoff_time,
            pickupLocation: data.pickup_location,
            returnLocation: data.dropoff_location,
            totalPrice: data.total_price
          };
          const carData = { brand: data.brand, model: data.model, tag: data.tag, caution_amount: data.caution_amount };
          const userData = { firstName: data.first_name, lastName: data.last_name, email: data.email };
          
          sendBookingConfirmationEmail(bookingId, bookingData, carData, userData, 'confirmed');
        }
      } catch (emailErr) {
        console.error('⚠️ Erreur lors de l\'envoi de l\'email de confirmation admin:', emailErr.message);
      }
    }

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
    const { changes, requestedBy, isAdminProposal } = req.body;
    console.log('Demande de modification reçue:', { bookingId: req.params.id, requestedBy, isAdminProposal });

    // S'assurer que requestedBy est un nombre ou null
    const proposerId = requestedBy && !isNaN(requestedBy) ? parseInt(requestedBy) : null;

    const [result] = await pool.query(
      'INSERT INTO modification_requests (booking_id, requested_by, changes, status, is_admin_proposal) VALUES (?, ?, ?, "pending", ?)',
      [
        req.params.id, 
        proposerId, 
        JSON.stringify(changes), 
        isAdminProposal ? 1 : 0
      ]
    );

    res.status(201).json({ success: true, modificationId: result.insertId });
  } catch (error) {
    console.error('Erreur création demande modification:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la demande de modification',
      details: error.message 
    });
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
      WHERE mr.requested_by = ? OR b.user_id = ?
      ORDER BY mr.created_at DESC
    `, [req.params.userId, req.params.userId]);
    
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
