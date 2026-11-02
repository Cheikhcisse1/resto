import Link from 'next/link';
export default function Home() {
  return (
    <section className="py-10">
      <h1 className="text-4xl font-bold leading-tight sm:text-5xl">L'hospitalité sénégalaise, servie chaude à Colobane.</h1>
      <p className="mt-4 max-w-xl text-lg">Sur place, à emporter ou livré chez vous : commandez en quelques touches depuis votre téléphone.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/menu" className="rounded-full bg-terracotta px-6 py-3 font-semibold text-white">Voir le menu</Link>
        <Link href="/commande" className="rounded-full border-2 border-baobab px-6 py-3 font-semibold text-baobab">Mon panier</Link>
      </div>
    </section>
  );
}
