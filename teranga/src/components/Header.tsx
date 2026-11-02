'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
export default function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-10 bg-creme/95 backdrop-blur border-b border-charbon/10">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-serif text-xl font-bold text-terracotta">Téranga Colobane</Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/menu">Menu</Link>
          <Link href="/commande" className="rounded-full bg-terracotta px-4 py-2 text-white">Panier ({count})</Link>
        </div>
      </nav>
    </header>
  );
}
