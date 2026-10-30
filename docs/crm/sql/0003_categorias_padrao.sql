-- ════════════════════════════════════════════════════════════════════
-- CRM dos serviços: categorias de vídeo padrão
-- --------------------------------------------------------------------
-- Cada linha pertence a um dono (auth.uid()), então não dá pra semear
-- pelo editor SQL, onde não há usuário logado. Em vez disso existe esta
-- função: o CRM chama `crm_semear_categorias()` no primeiro acesso, já
-- logado e com 2FA, e as categorias nascem do dono certo. Rodar de novo
-- não duplica. A lista é editável depois, nas Configurações.
-- ════════════════════════════════════════════════════════════════════

create or replace function public.crm_semear_categorias()
returns int
language plpgsql
security invoker
set search_path = public
as $$
declare
  novas int;
begin
  insert into public.categorias_video (nome, ordem)
  select nome, ordem
  from (values
    ('Casamento',        1),
    ('Aftermovie',       2),
    ('Making of',        3),
    ('Real Time',        4),
    ('Formatura',        5),
    ('Pre wedding',      6),
    ('Institucional',    7),
    ('Imobiliário',      8),
    ('Podcast',          9),
    ('Corte e Reels',   10),
    ('Evento',          11),
    ('Clipe',           12)
  ) as padrao (nome, ordem)
  on conflict (dono, nome) do nothing;

  get diagnostics novas = row_count;
  return novas;
end;
$$;

revoke execute on function public.crm_semear_categorias() from public, anon;
grant  execute on function public.crm_semear_categorias() to authenticated;
