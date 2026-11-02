'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
export type Line = { id: string; name: string; price: number; qty: number };
type Ctx = { lines: Line[]; add: (l: Omit<Line, 'qty'>) => void; setQty: (id: string, q: number) => void; clear: () => void; count: number; subtotal: number };
const C = createContext<Ctx | null>(null);
export const useCart = () => useContext(C)!;
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  useEffect(() => { try { setLines(JSON.parse(localStorage.getItem('cart') || '[]')); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem('cart', JSON.stringify(lines)); } catch {} }, [lines]);
  const add: Ctx['add'] = (l) => setLines((p) => p.some((x) => x.id === l.id) ? p.map((x) => x.id === l.id ? { ...x, qty: x.qty + 1 } : x) : [...p, { ...l, qty: 1 }]);
  const setQty: Ctx['setQty'] = (id, q) => setLines((p) => q <= 0 ? p.filter((x) => x.id !== id) : p.map((x) => x.id === id ? { ...x, qty: q } : x));
  const count = lines.reduce((s, l) => s + l.qty, 0), subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  return <C.Provider value={{ lines, add, setQty, clear: () => setLines([]), count, subtotal }}>{children}</C.Provider>;
}
