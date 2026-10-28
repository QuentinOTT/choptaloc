import { describe, expect, it } from 'vitest';
import { applyPromotion, bookingPrice, enabled } from './pricing';

describe('tarifs et promotions', () => {
  const car = { price: 100, price_48h: 180, price_48h_wk: 160, price_72h_wk: 240, price_mon_fri: 400, weeklyPrice: 600, monthlyPrice: 2000 };
  it('normalise les booléens MySQL sans activer les valeurs false ou 0', () => {
    expect([true, 1, '1', 'true'].every(enabled)).toBe(true);
    expect([false, 0, '0', 'false', null].some(enabled)).toBe(false);
  });
  it('applique la promotion véhicule aux forfaits et remplace la remise globale', () => {
    const result = bookingPrice({ ...car, has_promo: '1', promo_type: 'percentage', promo_value: 20 }, '2026-11-06', '2026-11-08', 10);
    expect(result).toMatchObject({ days: 2, rawTotal: 160, discount: 32, total: 128, isCarPromo: true });
  });
  it('déduit les euros par jour pour une promotion fixe', () => {
    expect(bookingPrice({ ...car, has_promo: true, promo_type: 'fixed', promo_value: 15 }, '2026-11-06', '2026-11-08').total).toBe(130);
  });
  it('applique la remise globale quand la promotion véhicule est inactive', () => {
    expect(bookingPrice({ ...car, has_promo: '0', promo_value: 30 }, '2026-11-02', '2026-11-04', 10).total).toBe(162);
  });
  it('choisit les forfaits selon les dates sans inventer de tarif 72h', () => {
    expect(bookingPrice(car, '2026-11-02', '2026-11-05').rawTotal).toBe(300);
    expect(bookingPrice(car, '2026-11-06', '2026-11-09').rawTotal).toBe(240);
    expect(bookingPrice(car, '2026-11-02', '2026-11-07').rawTotal).toBe(400);
    expect(bookingPrice(car, '2026-11-02', '2026-11-10').rawTotal).toBe(700);
    expect(bookingPrice(car, '2026-11-02', '2026-12-03').rawTotal).toBe(2100);
  });
  it('borne les remises et conserve les centimes', () => {
    expect(applyPromotion(99.99, 1, { price: 99.99 }, 15).total).toBe(84.99);
    expect(applyPromotion(100, 2, { price: 100, has_promo: true, promo_type: 'fixed', promo_value: 200 }).total).toBe(0);
    expect(applyPromotion(100, 1, car, 200).total).toBe(0);
  });
  it('retourne zéro pour des dates absentes, identiques ou inversées', () => {
    for (const [start, end] of [['', ''], ['2026-11-02', '2026-11-02'], ['2026-11-04', '2026-11-02']]) {
      expect(bookingPrice(car, start, end).total).toBe(0);
    }
  });
});
