create extension if not exists pgcrypto;
create table profiles(id uuid primary key references auth.users on delete cascade, full_name text, role text not null default 'customer' check (role in ('admin','staff','customer')));
create table settings(id int primary key default 1 check (id=1), name text default 'Téranga Colobane', address text, phone text, whatsapp text, hours text, instagram text, facebook text, tiktok text, maps_url text);
insert into settings(id) values (1);
create table categories(id uuid primary key default gen_random_uuid(), name text not null, position int default 0, active bool default true);
create table products(id uuid primary key default gen_random_uuid(), category_id uuid references categories on delete set null, name text not null, description text, price_fcfa int not null check (price_fcfa>=0), image_url text, available bool default true, created_at timestamptz default now());
create table delivery_zones(id uuid primary key default gen_random_uuid(), name text not null, fee_fcfa int not null check (fee_fcfa>=0), active bool default true);
create table customers(id uuid primary key default gen_random_uuid(), name text not null, phone text not null, address text, created_at timestamptz default now());
create table orders(id uuid primary key default gen_random_uuid(), customer_id uuid references customers, type text not null check (type in ('livraison','retrait')), zone_id uuid references delivery_zones, delivery_fee_fcfa int not null default 0, total_fcfa int not null check (total_fcfa>=0), status text not null default 'nouvelle' check (status in ('nouvelle','acceptee','refusee','prete','livree','annulee')), created_at timestamptz default now());
create table order_items(id uuid primary key default gen_random_uuid(), order_id uuid not null references orders on delete cascade, product_id uuid references products on delete set null, name text not null, unit_price_fcfa int not null, quantity int not null check (quantity>0));
create table payments(id uuid primary key default gen_random_uuid(), order_id uuid not null references orders on delete cascade, method text not null check (method in ('wave','orange_money','cash_livraison','sur_place')), status text not null default 'en_attente' check (status in ('en_attente','paye','echoue')), provider_ref text, created_at timestamptz default now());
create table reservations(id uuid primary key default gen_random_uuid(), name text not null, phone text not null, date date not null, time time not null, guests int not null check (guests between 1 and 50), status text not null default 'en_attente' check (status in ('en_attente','confirmee','refusee','annulee')), created_at timestamptz default now());
create table reviews(id uuid primary key default gen_random_uuid(), author text not null, rating int not null check (rating between 1 and 5), comment text, approved bool not null default false, created_at timestamptz default now());
create table promotions(id uuid primary key default gen_random_uuid(), title text not null, description text, discount_percent int check (discount_percent between 0 and 100), starts_on date, ends_on date, active bool default true);

create function is_admin() returns bool language sql security definer set search_path=public as
$$ select exists(select 1 from profiles where id=auth.uid() and role in ('admin','staff')) $$;

do $$ declare t text; begin
  foreach t in array array['profiles','settings','categories','products','delivery_zones','customers','orders','order_items','payments','reservations','reviews','promotions'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy admin_all on %I for all using (is_admin()) with check (is_admin())', t);
  end loop; end $$;

create policy pub_read on settings for select using (true);
create policy pub_read on categories for select using (active);
create policy pub_read on products for select using (available);
create policy pub_read on delivery_zones for select using (active);
create policy pub_read on promotions for select using (active);
create policy pub_read on reviews for select using (approved);
create policy own_profile on profiles for select using (id=auth.uid());
create policy pub_insert on reservations for insert with check (status='en_attente');
create policy pub_insert on reviews for insert with check (approved=false);
-- Les commandes sont créées uniquement par /api/orders (service role).
-- Créer le 1er admin : s'inscrire dans Supabase Auth, puis
-- insert into profiles(id, role) values ('<UUID de l''utilisateur>', 'admin');
