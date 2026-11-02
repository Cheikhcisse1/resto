'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart';
import { fcfa } from '@/lib/format';
type Zone = { id: string; name: string; fee_fcfa: number };
export default function Checkout({ zones }: { zones: Zone[] }) {
  const { lines, setQty, clear, subtotal } = useCart();
  const [type, setType] = useState<'livraison' | 'retrait'>('retrait');
  const [f, setF] = useState({ name: '', phone: '', address: '', zoneId: '', method: 'cash_livraison' });
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const fee = type === 'livraison' ? zones.find((z) => z.id === f.zoneId)?.fee_fcfa ?? 0 : 0;
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  async function submit() {
    setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, type, items: lines.map((l) => ({ id: l.id, qty: l.qty })) }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Erreur');
      clear();
      if (d.whatsappUrl) window.location.href = d.whatsappUrl; else setErr('Commande enregistrée. Le numéro WhatsApp du restaurant n\'est pas encore configuré.');
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }
  if (!lines.length) return <p>Votre panier est vide. Choisissez des plats dans le menu.</p>;
  const input = 'w-full rounded-lg border border-charbon/20 bg-white px-3 py-3';
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ma commande</h1>
      <ul className="divide-y divide-charbon/10">
        {lines.map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-3 py-3">
            <span>{l.name}<br /><b>{fcfa(l.price * l.qty)}</b></span>
            <span className="flex items-center gap-3">
              <button aria-label="Retirer un" onClick={() => setQty(l.id, l.qty - 1)} className="h-9 w-9 rounded-full border">−</button>
              <b>{l.qty}</b>
              <button aria-label="Ajouter un" onClick={() => setQty(l.id, l.qty + 1)} className="h-9 w-9 rounded-full border">+</button>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        {(['retrait', 'livraison'] as const).map((t) => (
          <button key={t} onClick={() => setType(t)} className={`flex-1 rounded-full px-4 py-3 font-semibold ${type === t ? 'bg-baobab text-white' : 'border'}`}>{t === 'retrait' ? 'Retrait sur place' : 'Livraison'}</button>
        ))}
      </div>
      <input className={input} placeholder="Nom" value={f.name} onChange={set('name')} autoComplete="name" />
      <input className={input} placeholder="Téléphone" inputMode="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" />
      {type === 'livraison' && (<>
        <select className={input} value={f.zoneId} onChange={set('zoneId')}>
          <option value="">{zones.length ? 'Choisir une zone' : 'Zones de livraison bientôt disponibles'}</option>
          {zones.map((z) => <option key={z.id} value={z.id}>{z.name} (+{fcfa(z.fee_fcfa)})</option>)}
        </select>
        <input className={input} placeholder="Adresse de livraison" value={f.address} onChange={set('address')} />
      </>)}
      <select className={input} value={f.method} onChange={set('method')}>
        <option value="cash_livraison">Espèces à la livraison</option>
        <option value="sur_place">Paiement sur place</option>
      </select>
      <p className="text-xs opacity-70">Wave et Orange Money seront proposés une fois les comptes marchand configurés.</p>
      <p className="text-xl">Total : <b className="text-terracotta">{fcfa(subtotal + fee)}</b>{fee > 0 && <span className="text-sm"> (dont livraison {fcfa(fee)})</span>}</p>
      {err && <p role="alert" className="text-terracotta">{err}</p>}
      <button disabled={busy} onClick={submit} className="w-full rounded-full bg-terracotta py-4 text-lg font-bold text-white disabled:opacity-50">{busy ? 'Envoi…' : 'Envoyer ma commande sur WhatsApp'}</button>
    </div>
  );
}
