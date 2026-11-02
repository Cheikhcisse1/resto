import { NextResponse } from 'next/server';
import { serviceClient } from '@/lib/supabase';
const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });
export async function POST(req: Request) {
  const db = serviceClient();
  if (!db) return bad('Base de données non configurée.', 503);
  const b = await req.json().catch(() => null);
  const name = String(b?.name ?? '').trim().slice(0, 80), phone = String(b?.phone ?? '').replace(/[^\d+]/g, '');
  const type = b?.type === 'livraison' ? 'livraison' : 'retrait';
  const method = b?.method === 'sur_place' ? 'sur_place' : 'cash_livraison';
  const items: { id: string; qty: number }[] = Array.isArray(b?.items) ? b.items.slice(0, 50) : [];
  if (!name || phone.length < 8) return bad('Nom et téléphone valides requis.');
  if (!items.length) return bad('Panier vide.');
  const address = String(b?.address ?? '').trim().slice(0, 200);
  let fee = 0, zoneId: string | null = null, zoneName = '';
  if (type === 'livraison') {
    if (!address) return bad('Adresse de livraison requise.');
    const { data: z } = await db.from('delivery_zones').select('id,name,fee_fcfa').eq('id', b.zoneId).eq('active', true).maybeSingle();
    if (!z) return bad('Choisissez une zone de livraison.');
    fee = z.fee_fcfa; zoneId = z.id; zoneName = z.name;
  }
  const { data: prods } = await db.from('products').select('id,name,price_fcfa').in('id', items.map((i) => i.id)).eq('available', true);
  const lines = items.map((i) => { const p = prods?.find((x) => x.id === i.id); const q = Math.floor(Number(i.qty)); return p && q > 0 && q <= 50 ? { p, q } : null; });
  if (lines.some((l) => !l)) return bad('Un plat du panier n\'est plus disponible.');
  const ok = lines as { p: { id: string; name: string; price_fcfa: number }; q: number }[];
  const total = ok.reduce((s, l) => s + l.p.price_fcfa * l.q, 0) + fee; // recalculé côté serveur
  const { data: cust } = await db.from('customers').insert({ name, phone, address: address || null }).select('id').single();
  const { data: order, error } = await db.from('orders').insert({ customer_id: cust?.id, type, zone_id: zoneId, delivery_fee_fcfa: fee, total_fcfa: total }).select('id').single();
  if (error || !order) return bad('Enregistrement impossible.', 500);
  await db.from('order_items').insert(ok.map((l) => ({ order_id: order.id, product_id: l.p.id, name: l.p.name, unit_price_fcfa: l.p.price_fcfa, quantity: l.q })));
  await db.from('payments').insert({ order_id: order.id, method, status: 'en_attente' });
  const wa = process.env.NEXT_PUBLIC_WHATSAPP;
  const fr = (n: number) => new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
  const text = [`Nouvelle commande Téranga Colobane #${order.id.slice(0, 8)}`, ...ok.map((l) => `${l.q} x ${l.p.name} : ${fr(l.p.price_fcfa * l.q)}`),
    type === 'livraison' ? `Livraison (${zoneName}) : ${fr(fee)}\nAdresse : ${address}` : 'Retrait sur place', `Total : ${fr(total)}`,
    `Paiement : ${method === 'sur_place' ? 'sur place' : 'espèces à la livraison'}`, `Client : ${name} (${phone})`].join('\n');
  return NextResponse.json({ orderId: order.id, whatsappUrl: wa ? `https://wa.me/${wa}?text=${encodeURIComponent(text)}` : null });
}
