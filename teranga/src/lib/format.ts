export const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`;
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || '';
