// Stripe price IDs - Produção
export const STRIPE_PRICES = {
  monthly: "price_1Sp7ftDuUdrahCUJDxAK8L6r", // R$19,90/mês
  annual: "price_1Sp7hIDuUdrahCUJfjhWLv9u",  // R$140,00/ano
} as const;

export const STRIPE_PRODUCTS = {
  premium_monthly: "prod_Tmh4xyP6A3RKHG",
  premium_annual: "prod_Tmh5Mxt808nDF0",
} as const;

export const PLAN_PRICES = {
  monthly: 1990,  // R$19,90 em centavos
  annual: 14000,  // R$140,00 em centavos
} as const;

export const formatPrice = (priceInCents: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(priceInCents / 100);
};
