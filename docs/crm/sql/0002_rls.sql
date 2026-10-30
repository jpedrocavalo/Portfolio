-- ════════════════════════════════════════════════════════════════════
-- CRM dos serviços: segurança (RLS)
-- --------------------------------------------------------------------
-- Regra única, em TODAS as tabelas: só lê e escreve quem
--   1. é o dono da linha (auth.uid() = dono), E
--   2. concluiu a 2FA nesta sessão (aal2).
--
-- Quem entra só com e-mail e senha (aal1) enxerga zero linhas.
-- A chave pública (anon) que fica no código da página não dá acesso a nada:
-- sem login o Postgres devolve vazio ou erro de permissão.
--
-- Antes de usar: no painel do Supabase, em Authentication, DESLIGUE o
-- cadastro público ("Allow new users to sign up"). Sem isso, qualquer
-- pessoa que achasse a página poderia criar uma conta (ela não leria nada,
-- por causa do RLS, mas não deve nem existir).
-- ════════════════════════════════════════════════════════════════════

-- anon não toca em nada do esquema public
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon;

do $$
declare
  t text;
begin
  foreach t in array array[
    'clientes', 'clientes_cobranca', 'contratos_mensais', 'categorias_video',
    'servicos', 'projetos', 'trabalhos', 'recebiveis', 'despesas', 'leads',
    'orcamentos', 'tarefas', 'interacoes', 'modelos_mensagem', 'metas', 'config'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    -- force: vale até para o dono da tabela, então um engano de papel
    -- não abre a porta
    execute format('alter table public.%I force row level security', t);
    execute format(
      'create policy %I on public.%I
         for all to authenticated
         using (auth.uid() = dono and (auth.jwt() ->> ''aal'') = ''aal2'')
         with check (auth.uid() = dono and (auth.jwt() ->> ''aal'') = ''aal2'')',
      t || '_dono_aal2', t
    );
  end loop;
end $$;

-- Auditoria: só leitura e inserção. Sem update nem delete, de propósito.
alter table public.auditoria enable row level security;
alter table public.auditoria force row level security;

create policy auditoria_ler on public.auditoria
  for select to authenticated
  using (auth.uid() = dono and (auth.jwt() ->> 'aal') = 'aal2');

create policy auditoria_inserir on public.auditoria
  for insert to authenticated
  with check (auth.uid() = dono and (auth.jwt() ->> 'aal') = 'aal2');

revoke update, delete on public.auditoria from authenticated;
