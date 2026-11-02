import { publicClient } from '@/lib/supabase';
import Checkout from '@/components/Checkout';
export const metadata = { title: 'Commande | Téranga Colobane' };
export default async function Page() {
  const db = publicClient();
  const { data } = db ? await db.from('delivery_zones').select('id,name,fee_fcfa').order('name') : { data: [] };
  return <Checkout zones={data ?? []} />;
}
