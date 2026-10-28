const { test } = require('node:test');
const assert = require('node:assert/strict');
const { promoDiscount, quoteBooking } = require('./promotions');
const { bookingPrice } = require('./pricing');
test('Clio 70 euros moins 35 % = 45,50 euros par jour et 91 euros pour deux jours', () => {
  const car = { price: 70, has_promo: 1, promo_type: 'percentage', promo_value: '35.00' };
  assert.equal(bookingPrice(car, '2026-11-02', '2026-11-03').total, 45.5);
  assert.equal(bookingPrice(car, '2026-11-02', '2026-11-04').total, 91);
});
test('le code est borné au montant restant, et les dates et quotas sont contrôlés', () => {
  const promo = { is_active: 1, discount_type: 'percentage', discount_value: 10, min_booking_amount: 0, max_uses: 2, current_uses: 0 };
  assert.equal(promoDiscount(promo, 91), 9.1);
  assert.equal(promoDiscount({ ...promo, discount_type: 'fixed', discount_value: 500 }, 91), 91);
  assert.throws(() => promoDiscount({ ...promo, current_uses: 2 }, 91), /épuisé/);
  assert.throws(() => promoDiscount({ ...promo, valid_until: '2000-01-01' }, 91), /expiré/);
  assert.throws(() => promoDiscount({ ...promo, min_booking_amount: 100 }, 91), /minimum/);
});
test('le serveur charge les tarifs MySQL au lieu de faire confiance au client', async () => {
  const db = { query: async sql => sql.includes('FROM cars') ? [[{ price_per_day: '70.00', has_promo: 1, promo_type: 'percentage', promo_value: '35.00' }]] : [[{ value: '10' }]] };
  assert.equal((await quoteBooking(db, 4, '2026-11-02', '2026-11-03')).total, 45.5);
});
