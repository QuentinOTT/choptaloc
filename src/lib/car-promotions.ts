import { API_URL } from '@/config/api';
import { enabled } from './pricing';
import { readApiResponse } from './api-response';

export async function verifyCarPromotion(id: string, expected: { has_promo: boolean; promo_type: string; promo_value: string }) {
  const response = await fetch(`${API_URL}/cars/${id}`, { cache: 'no-store' });
  if (!response.ok) throw new Error("Impossible de vérifier l'enregistrement de la promotion.");
  const saved = await readApiResponse<any>(response);
  if (enabled(saved.has_promo) !== expected.has_promo || (expected.has_promo && (saved.promo_type !== expected.promo_type || Math.abs(Number(saved.promo_value) - Number(expected.promo_value)) > 0.001 || !Number.isFinite(Number(saved.promo_value))))) {
    throw new Error("La promotion n'a pas été enregistrée par le serveur. Le backend corrigé doit être installé sur l'API utilisée ; la fiche reste ouverte pour conserver votre saisie.");
  }
}
