const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Récupérer tous les véhicules
router.get('/', async (req, res) => {
  try {
    const [cars] = await pool.query('SELECT * FROM cars ORDER BY createdAt DESC');
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
    const { brand, model, tag, price, weeklyPrice, monthlyPrice, image, specs, available } = req.body;

    const [result] = await pool.query(
      'INSERT INTO cars (brand, model, tag, price, weeklyPrice, monthlyPrice, image, specs, available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [brand, model, tag, price, weeklyPrice, monthlyPrice, image, JSON.stringify(specs), available]
    );

    res.status(201).json({ success: true, carId: result.insertId });
  } catch (error) {
    console.error('Erreur ajout véhicule:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du véhicule' });
  }
});

// Mettre à jour un véhicule
router.put('/:id', async (req, res) => {
  try {
    const { brand, model, tag, price, weeklyPrice, monthlyPrice, image, specs, available } = req.body;

    await pool.query(
      'UPDATE cars SET brand = ?, model = ?, tag = ?, price = ?, weeklyPrice = ?, monthlyPrice = ?, image = ?, specs = ?, available = ? WHERE id = ?',
      [brand, model, tag, price, weeklyPrice, monthlyPrice, image, JSON.stringify(specs), available, req.params.id]
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
    const { available } = req.body;

    await pool.query(
      'UPDATE cars SET available = ? WHERE id = ?',
      [available, req.params.id]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur mise à jour disponibilité:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la disponibilité' });
  }
});

module.exports = router;
