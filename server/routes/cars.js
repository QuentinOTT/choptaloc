const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Récupérer tous les véhicules
router.get('/', async (req, res) => {
  try {
    const [cars] = await pool.query('SELECT * FROM cars ORDER BY created_at DESC');
    res.json(cars);
  } catch (error) {
    console.error('Erreur récupération véhicules:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des véhicules' });
  }
});

// Récupérer un véhicule par ID
router.get('/:id', async (req, res) => {
  try {
    const [cars] = await pool.query('SELECT * FROM cars WHERE id = ?', [req.params.id]);

    if (cars.length === 0) {
      return res.status(404).json({ error: 'Véhicule non trouvé' });
    }

    res.json(cars[0]);
  } catch (error) {
    console.error('Erreur récupération véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du véhicule' });
  }
});

// Ajouter un véhicule
router.post('/', async (req, res) => {
  try {
    const { brand, model, tag, price_per_day, image_url, specs, is_available } = req.body;

    const [result] = await pool.query(
      'INSERT INTO cars (brand, model, tag, price_per_day, image_url, specs, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [brand, model, tag, price_per_day, image_url, JSON.stringify(specs), is_available !== false]
    );

    res.status(201).json({ success: true, carId: result.insertId });
  } catch (error) {
    console.error('Erreur ajout véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du véhicule' });
  }
});

// Mettre à jour un véhicule (partiel)
router.put('/:id', async (req, res) => {
  try {
    const { 
      brand, 
      model, 
      tag, 
      price_per_day, 
      weekly_price, 
      monthly_price, 
      image_url, 
      specs, 
      is_available,
      description,
      features
    } = req.body;

    const updates = [];
    const values = [];

    if (brand !== undefined) { updates.push('brand = ?'); values.push(brand); }
    if (model !== undefined) { updates.push('model = ?'); values.push(model); }
    if (tag !== undefined) { updates.push('tag = ?'); values.push(tag); }
    if (price_per_day !== undefined) { updates.push('price_per_day = ?'); values.push(price_per_day); }
    if (weekly_price !== undefined) { updates.push('weekly_price = ?'); values.push(weekly_price); }
    if (monthly_price !== undefined) { updates.push('monthly_price = ?'); values.push(monthly_price); }
    if (image_url !== undefined) { updates.push('image_url = ?'); values.push(image_url); }
    if (specs !== undefined) { updates.push('specs = ?'); values.push(JSON.stringify(specs)); }
    if (is_available !== undefined) { updates.push('is_available = ?'); values.push(is_available); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (features !== undefined) { updates.push('features = ?'); values.push(JSON.stringify(features)); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
    }

    values.push(req.params.id);

    await pool.query(
      `UPDATE cars SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du véhicule' });
  }
});

// Mettre à jour la disponibilité d'un véhicule
router.put('/:id/availability', async (req, res) => {
  try {
    const { is_available } = req.body;

    await pool.query(
      'UPDATE cars SET is_available = ? WHERE id = ?',
      [is_available, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour disponibilité:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la disponibilité' });
  }
});

module.exports = router;
