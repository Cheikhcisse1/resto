import { publicClient } from '@/lib/supabase';
import { fcfa } from '@/lib/format';
import AddButton from '@/components/AddButton';
export const revalidate = 60;
export const metadata = { title: 'Menu | Téranga Colobane' };
export default async function Menu() {
  const db = publicClient();
  if (!db) return <p>Connectez Supabase (voir README) pour afficher le menu.</p>;
  const { data: cats } = await db.from('categories').select('id,name,products(id,name,description,price_fcfa,available)').order('position');
  const shown = (cats ?? []).filter((c: any) => c.products?.some((p: any) => p.available));
  if (!shown.length) return <p>Le menu sera bientôt disponible. Le restaurant peut ajouter ses plats depuis la base de données.</p>;
  return (
    <div className="space-y-8">
      {shown.map((c: any) => (
        <section key={c.id}>
          <h2 className="mb-3 text-2xl font-bold">{c.name}</h2>
          <ul className="divide-y divide-charbon/10">
            {c.products.filter((p: any) => p.available).map((p: any) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                <div><p className="font-semibold">{p.name}</p>{p.description && <p className="text-sm opacity-70">{p.description}</p>}<p className="mt-1 font-bold text-terracotta">{fcfa(p.price_fcfa)}</p></div>
                <AddButton id={p.id} name={p.name} price={p.price_fcfa} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
