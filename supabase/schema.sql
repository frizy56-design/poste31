-- =====================================================================
--  Poste 31 : comptes sans e-mail et sauvegarde de la progression
--  À coller en entier dans Supabase > SQL Editor > New query > Run.
--  Le script peut être relancé sans risque : il ne supprime aucune donnée.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- Les tables vivent dans un schéma privé : le site ne peut pas les lire
-- directement, il passe uniquement par les fonctions p31_* plus bas.
create schema if not exists p31_private;

create table if not exists p31_private.players (
  id              uuid primary key default gen_random_uuid(),
  username        text not null unique,
  pass_hash       text not null,
  question        text not null,
  answer_hash     text not null,
  failed_attempts integer not null default 0,
  locked_until    timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists p31_private.sessions (
  token_hash  text primary key,
  player_id   uuid not null references p31_private.players(id) on delete cascade,
  created_at  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  expires_at  timestamptz not null
);
create index if not exists sessions_player_idx on p31_private.sessions(player_id);

create table if not exists p31_private.progress (
  player_id  uuid primary key references p31_private.players(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table p31_private.players  enable row level security;
alter table p31_private.sessions enable row level security;
alter table p31_private.progress enable row level security;

revoke all on schema p31_private from public;
revoke all on all tables in schema p31_private from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on schema p31_private from anon, authenticated';
    execute 'revoke all on all tables in schema p31_private from anon, authenticated';
  end if;
end $$;

-- ---------------------------------------------------------------------
--  Fonctions internes (non accessibles depuis le site)
-- ---------------------------------------------------------------------

create or replace function p31_private.hash_token(p_token text)
returns text language sql immutable set search_path = '' as $$
  select encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

create or replace function p31_private.new_session(p_player uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_token text := encode(extensions.gen_random_bytes(32), 'hex');
begin
  delete from p31_private.sessions where expires_at < now();
  -- on garde au plus 20 appareils connectés par joueur
  delete from p31_private.sessions
   where player_id = p_player
     and token_hash not in (select token_hash from p31_private.sessions
                             where player_id = p_player order by last_seen desc limit 19);
  insert into p31_private.sessions(token_hash, player_id, expires_at)
  values (p31_private.hash_token(v_token), p_player, now() + interval '400 days');
  return v_token;
end $$;

create or replace function p31_private.session_player(p_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_player uuid;
  v_hash text;
begin
  if p_token is null or length(p_token) <> 64 then return null; end if;
  v_hash := p31_private.hash_token(p_token);
  select player_id into v_player from p31_private.sessions
   where token_hash = v_hash and expires_at > now();
  if v_player is not null then
    -- la session se prolonge toute seule tant qu'on joue
    update p31_private.sessions
       set last_seen = now(), expires_at = now() + interval '400 days'
     where token_hash = v_hash and last_seen < now() - interval '1 day';
  end if;
  return v_player;
end $$;

create or replace function p31_private.norm_username(p text)
returns text language sql immutable set search_path = '' as $$
  select lower(trim(coalesce(p, '')));
$$;

create or replace function p31_private.norm_answer(p text)
returns text language sql immutable set search_path = '' as $$
  select regexp_replace(lower(trim(coalesce(p, ''))), '\s+', ' ', 'g');
$$;

revoke execute on all functions in schema p31_private from public;

-- ---------------------------------------------------------------------
--  Fonctions appelées par le site
--  Elles renvoient toujours un objet JSON : { ok: true, ... } ou
--  { ok: false, error: "code" } ; le site traduit le code en message.
-- ---------------------------------------------------------------------

create or replace function public.p31_signup(p_username text, p_password text, p_question text, p_answer text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_user text := p31_private.norm_username(p_username);
  v_answer text := p31_private.norm_answer(p_answer);
  v_id uuid;
begin
  if v_user !~ '^[a-z0-9][a-z0-9._-]{2,19}$' then
    return json_build_object('ok', false, 'error', 'bad_username');
  end if;
  if p_password is null or length(p_password) < 6 or octet_length(p_password) > 72 then
    return json_build_object('ok', false, 'error', 'bad_password');
  end if;
  if p_question is null or length(trim(p_question)) < 5 or length(p_question) > 120 then
    return json_build_object('ok', false, 'error', 'bad_question');
  end if;
  if length(v_answer) < 1 or length(v_answer) > 60 then
    return json_build_object('ok', false, 'error', 'bad_answer');
  end if;
  -- garde-fou contre les inscriptions en masse
  if (select count(*) from p31_private.players where created_at > now() - interval '1 hour') >= 60 then
    return json_build_object('ok', false, 'error', 'busy');
  end if;
  if exists (select 1 from p31_private.players where username = v_user) then
    return json_build_object('ok', false, 'error', 'taken');
  end if;
  insert into p31_private.players(username, pass_hash, question, answer_hash)
  values (v_user,
          extensions.crypt(p_password, extensions.gen_salt('bf', 8)),
          trim(p_question),
          extensions.crypt(v_answer, extensions.gen_salt('bf', 8)))
  returning id into v_id;
  return json_build_object('ok', true, 'username', v_user, 'token', p31_private.new_session(v_id));
exception when unique_violation then
  return json_build_object('ok', false, 'error', 'taken');
end $$;

create or replace function public.p31_login(p_username text, p_password text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_user text := p31_private.norm_username(p_username);
  r p31_private.players%rowtype;
begin
  select * into r from p31_private.players where username = v_user;
  if not found then
    return json_build_object('ok', false, 'error', 'bad_credentials');
  end if;
  if r.locked_until is not null and r.locked_until > now() then
    return json_build_object('ok', false, 'error', 'locked',
      'minutes', ceil(extract(epoch from (r.locked_until - now())) / 60));
  end if;
  if r.pass_hash <> extensions.crypt(coalesce(p_password, ''), r.pass_hash) then
    update p31_private.players
       set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
           locked_until    = case when failed_attempts + 1 >= 5 then now() + interval '10 minutes' else locked_until end
     where id = r.id;
    return json_build_object('ok', false, 'error', 'bad_credentials');
  end if;
  update p31_private.players set failed_attempts = 0, locked_until = null where id = r.id;
  return json_build_object('ok', true, 'username', r.username, 'token', p31_private.new_session(r.id));
end $$;

create or replace function public.p31_question(p_username text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_q text;
begin
  select question into v_q from p31_private.players where username = p31_private.norm_username(p_username);
  if v_q is null then
    return json_build_object('ok', false, 'error', 'unknown_user');
  end if;
  return json_build_object('ok', true, 'question', v_q);
end $$;

create or replace function public.p31_recover(p_username text, p_answer text, p_new_password text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  r p31_private.players%rowtype;
begin
  select * into r from p31_private.players where username = p31_private.norm_username(p_username);
  if not found then
    return json_build_object('ok', false, 'error', 'unknown_user');
  end if;
  if r.locked_until is not null and r.locked_until > now() then
    return json_build_object('ok', false, 'error', 'locked',
      'minutes', ceil(extract(epoch from (r.locked_until - now())) / 60));
  end if;
  if p_new_password is null or length(p_new_password) < 6 or octet_length(p_new_password) > 72 then
    return json_build_object('ok', false, 'error', 'bad_password');
  end if;
  if r.answer_hash <> extensions.crypt(p31_private.norm_answer(p_answer), r.answer_hash) then
    update p31_private.players
       set failed_attempts = case when failed_attempts + 1 >= 5 then 0 else failed_attempts + 1 end,
           locked_until    = case when failed_attempts + 1 >= 5 then now() + interval '10 minutes' else locked_until end
     where id = r.id;
    return json_build_object('ok', false, 'error', 'bad_answer');
  end if;
  update p31_private.players
     set pass_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf', 8)),
         failed_attempts = 0, locked_until = null
   where id = r.id;
  -- nouveau mot de passe : on déconnecte les autres appareils
  delete from p31_private.sessions where player_id = r.id;
  return json_build_object('ok', true, 'username', r.username, 'token', p31_private.new_session(r.id));
end $$;

create or replace function public.p31_me(p_token text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_player uuid := p31_private.session_player(p_token);
begin
  if v_player is null then return json_build_object('ok', false, 'error', 'no_session'); end if;
  return json_build_object('ok', true, 'username', (select username from p31_private.players where id = v_player));
end $$;

create or replace function public.p31_load(p_token text)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_player uuid := p31_private.session_player(p_token);
  r p31_private.progress%rowtype;
begin
  if v_player is null then return json_build_object('ok', false, 'error', 'no_session'); end if;
  select * into r from p31_private.progress where player_id = v_player;
  return json_build_object('ok', true,
    'username', (select username from p31_private.players where id = v_player),
    'data', case when found then r.data else null end,
    'updated_at', case when found then r.updated_at else null end);
end $$;

create or replace function public.p31_save(p_token text, p_data jsonb)
returns json language plpgsql security definer set search_path = '' as $$
declare
  v_player uuid := p31_private.session_player(p_token);
begin
  if v_player is null then return json_build_object('ok', false, 'error', 'no_session'); end if;
  if p_data is null or jsonb_typeof(p_data) <> 'object' or length(p_data::text) > 300000 then
    return json_build_object('ok', false, 'error', 'bad_data');
  end if;
  insert into p31_private.progress(player_id, data, updated_at)
  values (v_player, p_data, now())
  on conflict (player_id) do update set data = excluded.data, updated_at = now();
  return json_build_object('ok', true, 'updated_at', now());
end $$;

create or replace function public.p31_logout(p_token text)
returns json language plpgsql security definer set search_path = '' as $$
begin
  if p_token is not null and length(p_token) = 64 then
    delete from p31_private.sessions where token_hash = p31_private.hash_token(p_token);
  end if;
  return json_build_object('ok', true);
end $$;

-- Seules ces fonctions sont ouvertes au site
revoke execute on function public.p31_signup(text, text, text, text) from public;
revoke execute on function public.p31_login(text, text) from public;
revoke execute on function public.p31_question(text) from public;
revoke execute on function public.p31_recover(text, text, text) from public;
revoke execute on function public.p31_me(text) from public;
revoke execute on function public.p31_load(text) from public;
revoke execute on function public.p31_save(text, jsonb) from public;
revoke execute on function public.p31_logout(text) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'grant execute on function public.p31_signup(text, text, text, text) to anon, authenticated';
    execute 'grant execute on function public.p31_login(text, text) to anon, authenticated';
    execute 'grant execute on function public.p31_question(text) to anon, authenticated';
    execute 'grant execute on function public.p31_recover(text, text, text) to anon, authenticated';
    execute 'grant execute on function public.p31_me(text) to anon, authenticated';
    execute 'grant execute on function public.p31_load(text) to anon, authenticated';
    execute 'grant execute on function public.p31_save(text, jsonb) to anon, authenticated';
    execute 'grant execute on function public.p31_logout(text) to anon, authenticated';
  end if;
end $$;

-- Recharge le cache de l'API pour que les nouvelles fonctions soient visibles tout de suite
notify pgrst, 'reload schema';
