const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { quoteBooking, promoDiscount } = require('../lib/promotions');

// GET tous les codes promo
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.brand AS car_brand, c.model AS car_model
      FROM promo_codes p
      LEFT JOIN cars c ON c.id = p.car_id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ error: 'Les codes promotionnels sont indisponibles : la table promo_codes est absente. Aucune modification de la base n’a été effectuée.' });
    }
    console.error('Erreur récupération codes promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET un code promo par ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.brand AS car_brand, c.model AS car_model
      FROM promo_codes p
      LEFT JOIN cars c ON c.id = p.car_id
      WHERE p.id = ?
    `, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Code promo non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur récupération code promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST créer un code promo
router.post('/', async (req, res) => {
  try {
    const { code, discount_type, discount_value, max_uses, valid_from, valid_until, min_booking_amount, is_active, description } = req.body;
    const carId = req.body.car_id === '' || req.body.car_id === null || req.body.car_id === undefined ? null : Number(req.body.car_id);
    if (!String(code || '').trim() || !['percentage', 'fixed'].includes(discount_type) || !Number.isFinite(Number(discount_value)) || Number(discount_value) <= 0 || (discount_type === 'percentage' && Number(discount_value) > 100) || (max_uses != null && (!Number.isInteger(Number(max_uses)) || Number(max_uses) <= 0)) || Number(min_booking_amount || 0) < 0 || (valid_from && !Number.isFinite(Date.parse(valid_from))) || (valid_until && !Number.isFinite(Date.parse(valid_until))) || (valid_from && valid_until && new Date(valid_until) < new Date(valid_from))) {
      return res.status(400).json({ error: 'Vérifiez le code, la réduction, les limites et les dates de validité.' });
    }

    
    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    if (carId !== null) {
      if (!Number.isInteger(carId) || carId <= 0) return res.status(400).json({ error: 'Véhicule invalide.' });
      const [[car]] = await pool.query('SELECT id FROM cars WHERE id = ?', [carId]);
      if (!car) return res.status(400).json({ error: 'Véhicule introuvable.' });
    }

    const [result] = await pool.query(
      `INSERT INTO promo_codes (car_id, code, discount_type, discount_value, max_uses, valid_from, valid_until, min_booking_amount, is_active, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [carId, String(code).trim().toUpperCase(), discount_type, discount_value, max_uses || null, valid_from || null, valid_until || null, min_booking_amount || 0, is_active !== false, description || null]
    );

    const [newRow] = await pool.query(`
      SELECT p.*, c.brand AS car_brand, c.model AS car_model
      FROM promo_codes p
      LEFT JOIN cars c ON c.id = p.car_id
      WHERE p.id = ?
    `, [result.insertId]);
    res.status(201).json(newRow[0]);
  } catch (error) {
    console.error('Erreur création code promo:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ce code existe déjà' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT mettre à jour un code promo
router.put('/:id', async (req, res) => {
  try {
    const { code, discount_type, discount_value, max_uses, valid_from, valid_until, min_booking_amount, is_active, description } = req.body;
    const carId = req.body.car_id === '' || req.body.car_id === null || req.body.car_id === undefined ? null : Number(req.body.car_id);
    if (!String(code || '').trim() || !['percentage', 'fixed'].includes(discount_type) || !Number.isFinite(Number(discount_value)) || Number(discount_value) <= 0 || (discount_type === 'percentage' && Number(discount_value) > 100) || (max_uses != null && (!Number.isInteger(Number(max_uses)) || Number(max_uses) <= 0)) || Number(min_booking_amount || 0) < 0 || (valid_from && !Number.isFinite(Date.parse(valid_from))) || (valid_until && !Number.isFinite(Date.parse(valid_until))) || (valid_from && valid_until && new Date(valid_until) < new Date(valid_from))) {
      return res.status(400).json({ error: 'Vérifiez le code, la réduction, les limites et les dates de validité.' });
    }

    
    if (carId !== null) {
      if (!Number.isInteger(carId) || carId <= 0) return res.status(400).json({ error: 'Véhicule invalide.' });
      const [[car]] = await pool.query('SELECT id FROM cars WHERE id = ?', [carId]);
      if (!car) return res.status(400).json({ error: 'Véhicule introuvable.' });
    }

    const [result] = await pool.query(
      `UPDATE promo_codes SET car_id = ?, code = ?, discount_type = ?, discount_value = ?, max_uses = ?, valid_from = ?, valid_until = ?, min_booking_amount = ?, is_active = ?, description = ?
       WHERE id = ?`,
      [carId, String(code).trim().toUpperCase(), discount_type, discount_value, max_uses || null, valid_from || null, valid_until || null, min_booking_amount || 0, is_active !== false, description || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Code promo non trouvé' });
    }

    const [updatedRow] = await pool.query(`
      SELECT p.*, c.brand AS car_brand, c.model AS car_model
      FROM promo_codes p
      LEFT JOIN cars c ON c.id = p.car_id
      WHERE p.id = ?
    `, [req.params.id]);
    res.json(updatedRow[0]);
  } catch (error) {
    console.error('Erreur mise à jour code promo:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ce code existe déjà' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE supprimer un code promo
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM promo_codes WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Code promo non trouvé' });
    }
    
    res.json({ message: 'Code promo supprimé' });
  } catch (error) {
    console.error('Erreur suppression code promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST vérifier un code promo
router.post('/validate', async (req, res) => {
  try {
    const { code, booking_amount } = req.body;
    const amount = Number(booking_amount);
    if (booking_amount === undefined || booking_amount === null || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ valid: false, error: 'Sélectionnez des dates de réservation valides avant d’appliquer un code.' });
    }
    
    if (!code) {
      return res.status(400).json({ error: 'Code manquant' });
    }

    const [rows] = await pool.query(
      'SELECT * FROM promo_codes WHERE code = ? AND is_active = TRUE',
      [String(code).trim().toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Code invalide ou inactif' });
    }

    const promo = rows[0];
    if (promo.car_id !== null && promo.car_id !== undefined && Number(promo.car_id) !== Number(req.body.carId)) {
      return res.status(400).json({ valid: false, error: 'Ce code promo ne s’applique pas à ce véhicule.' });
    }
    const quoteAmount = req.body.carId && req.body.startDate && req.body.endDate
      ? (await quoteBooking(pool, req.body.carId, req.body.startDate, req.body.endDate)).total : amount;
    let discount;
    try { discount = promoDiscount(promo, quoteAmount); }
    catch (error) { return res.status(400).json({ valid: false, error: error.message }); }

    res.json({
      valid: true,
      discount: discount,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value
    });
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(503).json({ valid: false, error: 'Les codes promotionnels sont actuellement indisponibles.' });
    }
    console.error('Erreur validation code promo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
