'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
export default function AddButton(p: { id: string; name: string; price: number }) {
  const { add } = useCart(); const [done, setDone] = useState(false);
  return <button onClick={() => { add(p); setDone(true); setTimeout(() => setDone(false), 1200); }}
    className="rounded-full bg-baobab px-4 py-2 text-sm font-semibold text-white active:scale-95 transition">{done ? 'Ajouté' : 'Ajouter'}</button>;
}
