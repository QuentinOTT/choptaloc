import { afterEach, expect, it, vi } from 'vitest';
import { verifyCarPromotion } from './car-promotions';
afterEach(() => vi.unstubAllGlobals());
it('refuse un faux succès si un ancien backend ignore la promotion Clio à 35 %', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ has_promo: 0, promo_value: '0.00' }) }));
  await expect(verifyCarPromotion('4', { has_promo: true, promo_type: 'percentage', promo_value: '35' })).rejects.toThrow("n'a pas été enregistrée");
});
it('confirme uniquement les valeurs relues en base via API', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ has_promo: 1, promo_type: 'percentage', promo_value: '35.00' }) }));
  await expect(verifyCarPromotion('4', { has_promo: true, promo_type: 'percentage', promo_value: '35' })).resolves.toBeUndefined();
});
