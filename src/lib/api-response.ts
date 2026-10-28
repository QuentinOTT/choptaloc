export async function readApiResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers?.get?.('content-type') || '';
  if (contentType && !contentType.includes('application/json')) {
    if (response.status === 404) {
      throw new Error("L’API utilisée ne possède pas encore la route des codes promo. Déployez le backend corrigé, puis reconstruisez le frontend.");
    }
    throw new Error('Le serveur a renvoyé une page au lieu de l’API. Vérifiez que le frontend et le backend sont bien déployés ensemble.');
  }
  try {
    return await response.json() as T;
  } catch {
    throw new Error('Réponse API invalide. Vérifiez que le backend est bien à jour.');
  }
}
