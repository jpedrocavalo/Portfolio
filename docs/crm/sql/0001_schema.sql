-- ════════════════════════════════════════════════════════════════════
-- CRM dos serviços: esquema
-- --------------------------------------------------------------------
-- Para um projeto Supabase SEPARADO do Checkit (região São Paulo).
-- Rode os arquivos em ordem: 0001 (tabelas), 0002 (RLS), 0003 (categorias).
-- Nunca rode isto no banco do Checkit.
--
-- Toda tabela tem `dono`, preenchido sozinho com o usuário logado. O RLS
-- (0002) só deixa cada linha ser lida por quem é o dono E que concluiu a
-- 2FA. Hoje só existe um dono, mas a estrutura já comporta mais.
-- ════════════════════════════════════════════════════════════════════

-- Mantém `atualizado_em` em dia
create or replace function public.crm_tocar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

-- ─── Clientes ───────────────────────────────────────────────────────
create table public.clientes (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  nome          text not null,
  tipo          text not null default 'pessoa' check (tipo in ('produtora', 'pessoa')),
  contato       text,
  whatsapp      text,
  email         text,
  instagram     text,
  cidade        text,
  origem        text,
  indicado_por  uuid references public.clientes (id) on delete set null,
  status        text not null default 'ativo' check (status in ('lead', 'ativo', 'recorrente', 'inativo')),
  notas         text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Modelo de cobrança do cliente AO LONGO DO TEMPO. Um cliente pode pagar
-- por vídeo e, a partir de uma data, passar a pagar mensal: o histórico
-- avulso anterior continua valendo.
create table public.clientes_cobranca (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  cliente_id    uuid not null references public.clientes (id) on delete cascade,
  modelo        text not null check (modelo in ('avulso', 'mensal')),
  desde         date not null,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Termos do contrato mensal. Gera um recebível por mês até `fim`.
create table public.contratos_mensais (
  id               uuid primary key default gen_random_uuid(),
  dono             uuid not null default auth.uid(),
  cliente_id       uuid not null references public.clientes (id) on delete cascade,
  valor_mensal     numeric(12, 2) not null check (valor_mensal >= 0),
  dia_vencimento   int not null default 1 check (dia_vencimento between 1 and 28),
  inicio           date not null,
  fim              date,
  videos_inclusos  int check (videos_inclusos is null or videos_inclusos >= 0),
  ativo            boolean not null default true,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

-- ─── Catálogo ───────────────────────────────────────────────────────
create table public.categorias_video (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  nome          text not null,
  ordem         int not null default 0,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (dono, nome)
);

create table public.servicos (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  nome          text not null,
  linha         text not null default 'edicao' check (linha in ('edicao', 'color', 'sites', 'outro')),
  unidade       text not null default 'video' check (unidade in ('video', 'projeto', 'diaria', 'hora', 'mensal')),
  preco         numeric(12, 2) not null default 0 check (preco >= 0),
  preco_minimo  numeric(12, 2) check (preco_minimo is null or preco_minimo >= 0),
  prazo_dias    int check (prazo_dias is null or prazo_dias >= 0),
  descricao     text,
  ativo         boolean not null default true,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ─── Projetos e trabalhos (os vídeos) ───────────────────────────────
-- "Projeto" é o agrupador de vários vídeos de um mesmo cliente.
create table public.projetos (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  cliente_id    uuid references public.clientes (id) on delete set null,
  nome          text not null,
  ano           int,
  inicio        date,
  fim           date,
  notas         text,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.trabalhos (
  id                  uuid primary key default gen_random_uuid(),
  dono                uuid not null default auth.uid(),
  cliente_id          uuid not null references public.clientes (id) on delete cascade,
  projeto_id          uuid references public.projetos (id) on delete set null,
  servico_id          uuid references public.servicos (id) on delete set null,
  categoria_id        uuid references public.categorias_video (id) on delete set null,
  titulo              text not null,
  etapa               text not null default 'recebido'
                      check (etapa in ('recebido', 'edicao', 'revisao', 'color', 'aprovado', 'entregue', 'pago')),
  recebido_em         date,
  prazo               date,
  entregue_em         date,
  rodadas             int not null default 0 check (rodadas >= 0),
  -- Vazio quando o cliente é mensalista (a mensalidade é rateada nos gráficos)
  valor               numeric(12, 2) check (valor is null or valor >= 0),
  horas               numeric(8, 2) check (horas is null or horas >= 0),
  -- { drive, checkit, youtube, stream }
  links               jsonb not null default '{}'::jsonb,
  notas_tecnicas      text,
  entra_no_portfolio  boolean not null default false,
  criado_em           timestamptz not null default now(),
  atualizado_em       timestamptz not null default now()
);

-- ─── Financeiro ─────────────────────────────────────────────────────
-- Um recebível liga a cliente, projeto, trabalho ou contrato (qualquer
-- um, e pelo menos um). Um pagamento pode cobrir um projeto inteiro.
create table public.recebiveis (
  id             uuid primary key default gen_random_uuid(),
  dono           uuid not null default auth.uid(),
  cliente_id     uuid references public.clientes (id) on delete set null,
  projeto_id     uuid references public.projetos (id) on delete set null,
  trabalho_id    uuid references public.trabalhos (id) on delete set null,
  contrato_id    uuid references public.contratos_mensais (id) on delete set null,
  descricao      text,
  valor          numeric(12, 2) not null check (valor >= 0),
  vencimento     date not null,
  status         text not null default 'a_receber' check (status in ('a_receber', 'pago', 'cancelado')),
  pago_em        date,
  forma          text,
  parcela        int check (parcela is null or parcela >= 1),
  parcelas       int check (parcelas is null or parcelas >= 1),
  -- Chave da importação da planilha (data + nome normalizado + valor).
  -- Reimportar o mesmo arquivo não duplica.
  chave_importacao text,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  check (cliente_id is not null or projeto_id is not null
         or trabalho_id is not null or contrato_id is not null),
  check (status <> 'pago' or pago_em is not null)
);

create unique index recebiveis_chave_importacao_uq
  on public.recebiveis (dono, chave_importacao)
  where chave_importacao is not null;

create table public.despesas (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  descricao     text not null,
  valor         numeric(12, 2) not null check (valor >= 0),
  data          date not null,
  categoria     text not null default 'outros'
                check (categoria in ('software', 'equipamento', 'armazenamento', 'imposto', 'outros')),
  recorrente    boolean not null default false,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ─── Vendas ─────────────────────────────────────────────────────────
create table public.leads (
  id               uuid primary key default gen_random_uuid(),
  dono             uuid not null default auth.uid(),
  nome             text not null,
  cliente_id       uuid references public.clientes (id) on delete set null,
  servico_id       uuid references public.servicos (id) on delete set null,
  valor_estimado   numeric(12, 2) check (valor_estimado is null or valor_estimado >= 0),
  etapa            text not null default 'novo'
                   check (etapa in ('novo', 'conversa', 'orcamento', 'negociacao', 'fechado', 'perdido')),
  motivo_perda     text,
  proxima_acao     text,
  proxima_acao_em  date,
  origem           text,
  data_evento      date,
  criado_em        timestamptz not null default now(),
  atualizado_em    timestamptz not null default now()
);

create table public.orcamentos (
  id             uuid primary key default gen_random_uuid(),
  dono           uuid not null default auth.uid(),
  numero         int,
  cliente_id     uuid references public.clientes (id) on delete set null,
  lead_id        uuid references public.leads (id) on delete set null,
  status         text not null default 'rascunho' check (status in ('rascunho', 'enviado', 'aceito', 'recusado')),
  validade       date,
  -- capa, projeto, entregas, cronograma, estúdio (ver docs do plano)
  secoes         jsonb not null default '{}'::jsonb,
  -- [{ servico, valor, inclui }]
  itens          jsonb not null default '[]'::jsonb,
  desconto       numeric(12, 2) not null default 0 check (desconto >= 0),
  total          numeric(12, 2) not null default 0 check (total >= 0),
  condicoes      text,
  termos         text,
  motivo_recusa  text,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now()
);

-- ─── Rotina ─────────────────────────────────────────────────────────
create table public.tarefas (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  titulo        text not null,
  para          date,
  feita         boolean not null default false,
  cliente_id    uuid references public.clientes (id) on delete cascade,
  lead_id       uuid references public.leads (id) on delete cascade,
  trabalho_id   uuid references public.trabalhos (id) on delete cascade,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.interacoes (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  cliente_id    uuid not null references public.clientes (id) on delete cascade,
  tipo          text not null default 'nota' check (tipo in ('nota', 'whatsapp', 'ligacao', 'email', 'reuniao')),
  texto         text not null,
  em            timestamptz not null default now(),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.modelos_mensagem (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  nome          text not null,
  -- Variáveis: {cliente}, {valor}, {prazo}
  texto         text not null,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table public.metas (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  -- '2026' (ano) ou '2026-10' (mês)
  periodo       text not null check (periodo ~ '^[0-9]{4}(-[0-9]{2})?$'),
  tipo          text not null check (tipo in ('receita', 'videos')),
  valor         numeric(12, 2) not null check (valor >= 0),
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (dono, periodo, tipo)
);

-- Chave e valor: dados do estúdio, limite do MEI, rodapé da proposta
create table public.config (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  chave         text not null,
  valor         jsonb not null default 'null'::jsonb,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (dono, chave)
);

-- Registro de ações: só se acrescenta, não se edita nem se apaga (0002)
create table public.auditoria (
  id            uuid primary key default gen_random_uuid(),
  dono          uuid not null default auth.uid(),
  acao          text not null,
  tabela        text,
  registro_id   uuid,
  detalhe       jsonb not null default '{}'::jsonb,
  em            timestamptz not null default now()
);

-- ─── Índices que os gráficos e as listas vão usar ───────────────────
create index trabalhos_cliente_idx    on public.trabalhos (cliente_id);
create index trabalhos_projeto_idx    on public.trabalhos (projeto_id);
create index trabalhos_entregue_idx   on public.trabalhos (entregue_em);
create index recebiveis_cliente_idx   on public.recebiveis (cliente_id);
create index recebiveis_projeto_idx   on public.recebiveis (projeto_id);
create index recebiveis_status_idx    on public.recebiveis (status, vencimento);
create index recebiveis_pago_em_idx   on public.recebiveis (pago_em);
create index tarefas_para_idx         on public.tarefas (para) where not feita;
create index interacoes_cliente_idx   on public.interacoes (cliente_id, em desc);

-- ─── Trigger de atualizado_em em todas as tabelas que têm a coluna ──
do $$
declare
  t text;
begin
  foreach t in array array[
    'clientes', 'clientes_cobranca', 'contratos_mensais', 'categorias_video',
    'servicos', 'projetos', 'trabalhos', 'recebiveis', 'despesas', 'leads',
    'orcamentos', 'tarefas', 'interacoes', 'modelos_mensagem', 'metas', 'config'
  ] loop
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.crm_tocar_atualizado_em()',
      t || '_atualizado_em', t
    );
  end loop;
end $$;
