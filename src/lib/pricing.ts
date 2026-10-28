export interface PricingCar {
  price: number;
  price_24h?: number;
  price_48h?: number;
  price_48h_wk?: number;
  price_72h_wk?: number;
  price_mon_fri?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  has_promo?: boolean | number | string;
  promo_type?: string;
  promo_value?: number;
}

export const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
export const enabled = (value: unknown) => value === true || value === 1 || value === '1' || value === 'true';
const positive = (value: unknown) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

// Une promotion véhicule remplace la réduction globale, comme sur la flotte.
export function getPromotion(car: PricingCar, globalDiscount = 0) {
  const isCarPromo = enabled(car.has_promo) && positive(car.promo_value) > 0 && ['percentage', 'fixed'].includes(car.promo_type || '');
  return {
    isCarPromo,
    type: isCarPromo ? car.promo_type : 'percentage',
    value: isCarPromo ? positive(car.promo_value) : positive(globalDiscount),
  };
}

export function applyPromotion(amount: number, days: number, car: PricingCar, globalDiscount = 0) {
  const promotion = getPromotion(car, globalDiscount);
  const discount = money(Math.min(amount, promotion.type === 'fixed'
    ? promotion.value * days : amount * Math.min(100, promotion.value) / 100));
  return { ...promotion, discount, total: money(Math.max(0, amount - discount)) };
}

export function bookingPrice(car: PricingCar, start: string, end: string, globalDiscount = 0) {
  const duration = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000;
  const days = Number.isFinite(duration) ? Math.max(0, Math.floor(duration)) : 0;
  const day = new Date(`${start}T00:00:00Z`).getUTCDay();
  let rawTotal = days * car.price;
  let priceType = 'journalier';
  const use = (price: number, label: string) => { rawTotal = Number(price); priceType = label; };
  if (days === 1 && car.price_24h) use(car.price_24h, 'forfait 24h');
  else if (days === 2) {
    if ([0, 5, 6].includes(day) && car.price_48h_wk) use(car.price_48h_wk, 'forfait 48h week-end');
    else if (car.price_48h) use(car.price_48h, 'forfait 48h');
  } else if (days === 3 && [5, 6].includes(day) && car.price_72h_wk) use(car.price_72h_wk, 'forfait 72h week-end');
  else if (days === 5 && day === 1 && car.price_mon_fri) use(car.price_mon_fri, 'forfait lundi au vendredi');
  else if (days >= 30 && car.monthlyPrice) use(Math.floor(days / 30) * car.monthlyPrice + days % 30 * car.price, 'forfait mensuel');
  else if (days >= 7 && days < 30 && car.weeklyPrice) use(Math.floor(days / 7) * car.weeklyPrice + days % 7 * car.price, 'forfait hebdomadaire');
  rawTotal = money(rawTotal);
  return { days, rawTotal, priceType, ...applyPromotion(rawTotal, days, car, globalDiscount) };
}
