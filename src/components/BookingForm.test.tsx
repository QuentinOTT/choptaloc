import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BookingForm from './BookingForm';

const auth = vi.hoisted(() => ({ isAuthenticated: true, user: { id: 1, firstName: 'Test', lastName: 'Client', email: 'test@example.com', phone: '0600000000' } }));
vi.mock('@/hooks/use-client-auth', () => ({ useClientAuth: () => auth }));
vi.mock('@/context/SettingsContext', () => ({ useSettings: () => ({ settings: { global_discount: '10' } }) }));
vi.mock('react-router-dom', () => ({ useNavigate: () => vi.fn() }));

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('réservation avec promotions (API simulée)', () => {
  const car = { id: '1', brand: 'Test', model: 'Auto', image: '', price: 100, price_48h: 180 };
  const dates = ['2099-11-02', '2099-11-04'];
  it('affiche puis envoie exactement le total remisé au serveur', async () => {
    const fetchMock = vi.fn().mockImplementation(async (url: string, options: RequestInit) => {
      if (url.endsWith('/promo-codes/validate')) {
        const body = JSON.parse(options.body as string);
        return { ok: true, json: async () => ({ valid: true, discount: body.booking_amount * 0.1 }) };
      }
      return { ok: true, json: async () => ({ success: true }) };
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('alert', vi.fn());
    render(<BookingForm car={{ ...car, has_promo: true, promo_type: 'percentage', promo_value: 20 }} isOpen onClose={vi.fn()} selectedDates={dates} />);
    expect(screen.getByText('144.00€')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Code promotionnel (optionnel)'), { target: { value: 'TEST10' } });
    await waitFor(() => expect(screen.getByText('129.60€')).toBeInTheDocument(), { timeout: 2000 });
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).booking_amount).toBe(144);
    fireEvent.submit(document.querySelector('form')!);
    await waitFor(() => expect(fetchMock.mock.calls.some(([url]) => url.endsWith('/bookings'))).toBe(true));
    const booking = fetchMock.mock.calls.find(([url]) => url.endsWith('/bookings'))!;
    expect(JSON.parse(booking[1].body).totalPrice).toBe(129.6);
  });

  it('applique la réduction globale et revalide le code quand les dates changent', async () => {
    const fetchMock = vi.fn().mockImplementation(async (_url: string, options: RequestInit) => ({
      ok: true, json: async () => ({ valid: true, discount: JSON.parse(options.body as string).booking_amount * 0.1 }),
    }));
    vi.stubGlobal('fetch', fetchMock);
    render(<BookingForm car={car} isOpen onClose={vi.fn()} selectedDates={dates} />);
    expect(screen.getByText('162.00€')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Code promotionnel (optionnel)'), { target: { value: 'TEST10' } });
    await waitFor(() => expect(screen.getByText('145.80€')).toBeInTheDocument(), { timeout: 2000 });
    const inputs = document.querySelectorAll('input[type="date"]');
    fireEvent.change(inputs[inputs.length - 1], { target: { value: '2099-11-05' } });
    await waitFor(() => expect(screen.getByText('243.00€')).toBeInTheDocument(), { timeout: 2000 });
    expect(JSON.parse(fetchMock.mock.calls[fetchMock.mock.calls.length - 1][1].body).booking_amount).toBe(270);
  });
});
