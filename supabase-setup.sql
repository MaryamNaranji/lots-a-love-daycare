create table if not exists public.reviews (
  id uuid primary key,
  name text not null,
  email text not null,
  relationship text not null,
  rating integer not null check (rating between 1 and 5),
  review text not null,
  consent boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','ignored')),
  approval_token uuid,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists reviews_status_approved_at_idx
  on public.reviews (status, approved_at desc);

alter table public.reviews enable row level security;
-- No public RLS policies are needed. The website accesses this table only through
-- Vercel server-side API functions using the Supabase service-role key.
