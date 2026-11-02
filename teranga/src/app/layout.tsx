import './globals.css';
import type { Metadata } from 'next';
import { CartProvider } from '@/lib/cart';
import Header from '@/components/Header';
import { WHATSAPP } from '@/lib/format';
export const metadata: Metadata = {
  title: 'Téranga Colobane | Restaurant et livraison de repas à Colobane, Dakar',
  description: 'Commandez vos repas en ligne, réservez une table et faites-vous livrer à Colobane, Dakar.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr"><body>
      <CartProvider>
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        {WHATSAPP && <a href={`https://wa.me/${WHATSAPP}`} aria-label="Écrire sur WhatsApp" className="fixed bottom-4 right-4 rounded-full bg-baobab px-5 py-3 font-semibold text-white shadow-lg">WhatsApp</a>}
      </CartProvider>
    </body></html>
  );
}
