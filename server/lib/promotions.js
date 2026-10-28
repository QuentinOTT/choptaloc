const { bookingPrice, money } = require('./pricing');

function promoDiscount(promo, amount, now = new Date()) {
  if (!promo || ![true, 1, '1'].includes(promo.is_active)) throw new Error('Code invalide ou inactif');
  if (promo.valid_from && new Date(promo.valid_from) > now) throw new Error('Code pas encore valide');
  if (promo.valid_until && new Date(promo.valid_until) < now) throw new Error('Code expiré');
  if (promo.max_uses !== null && promo.max_uses !== undefined && Number(promo.current_uses) >= Number(promo.max_uses)) throw new Error('Code épuisé');
  if (amount < Number(promo.min_booking_amount || 0)) throw new Error(`Montant minimum : ${promo.min_booking_amount}€`);
  const value = Number(promo.discount_value);
  if (!Number.isFinite(value) || value <= 0 || !['percentage', 'fixed'].includes(promo.discount_type)) throw new Error('Code invalide');
  return money(Math.min(amount, promo.discount_type === 'percentage' ? amount * Math.min(100, value) / 100 : value));
}

async function quoteBooking(db, carId, start, end) {
  const [[car]] = await db.query('SELECT * FROM cars WHERE id = ?', [carId]);
  if (!car) throw new Error('Véhicule non trouvé');
  const [settings] = await db.query("SELECT value FROM settings WHERE key_name = 'global_discount'");
  const quote = bookingPrice({ ...car, price: Number(car.price_per_day), weeklyPrice: Number(car.weekly_price), monthlyPrice: Number(car.monthly_price) }, start, end, Number(settings[0]?.value || 0));
  if (!quote.days || !Number.isFinite(quote.total)) throw new Error('Dates de réservation invalides');
  return quote;
}

module.exports = { promoDiscount, quoteBooking };
