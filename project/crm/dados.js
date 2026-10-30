/* ════════════════════════════════════════════════════════════════
   CRM: CAMADA DE DADOS
   --------------------------------------------------------------
   As telas só conversam com `window.CRM.dados`, que tem sempre a
   mesma cara, seja o modo demonstração (memória, nada é salvo) ou o
   Supabase (dados-supabase.js, carregado só quando o config.js tem
   URL e chave):

     modo                'demo' | 'supabase'
     auth.sessao()       -> null | { email, passo }   passo: 'ok' | 'mfa' | 'mfa_cadastro'
     carregar()          -> { clientes: [...], trabalhos: [...], ... }
     criar(tabela, d)    -> linha criada
     atualizar(tabela, id, mudancas) -> linha
     apagar(tabela, id)

   `window.CRM.iniciar()` escolhe o modo e devolve a promessa do adaptador.
   ════════════════════════════════════════════════════════════════ */
(function (raiz) {
  const D = raiz.CRM.dominio;

  // Pais -> filhos (espelha os "on delete" do esquema SQL)
  const FILHOS = {
    clientes: [
      ['clientes_cobranca', 'cliente_id', 'apagar'], ['contratos_mensais', 'cliente_id', 'apagar'],
      ['trabalhos', 'cliente_id', 'apagar'], ['interacoes', 'cliente_id', 'apagar'], ['tarefas', 'cliente_id', 'apagar'],
      ['projetos', 'cliente_id', 'nulo'], ['recebiveis', 'cliente_id', 'nulo'], ['leads', 'cliente_id', 'nulo'],
      ['orcamentos', 'cliente_id', 'nulo'], ['clientes', 'indicado_por', 'nulo'],
    ],
    projetos: [['trabalhos', 'projeto_id', 'nulo'], ['recebiveis', 'projeto_id', 'nulo']],
    trabalhos: [['recebiveis', 'trabalho_id', 'nulo'], ['tarefas', 'trabalho_id', 'apagar']],
    contratos_mensais: [['recebiveis', 'contrato_id', 'nulo']],
    categorias_video: [['trabalhos', 'categoria_id', 'nulo']],
    servicos: [['trabalhos', 'servico_id', 'nulo'], ['leads', 'servico_id', 'nulo']],
    leads: [['orcamentos', 'lead_id', 'nulo'], ['tarefas', 'lead_id', 'apagar']],
  };

  // Valores que o banco preenche sozinho
  const PADROES = {
    clientes: { tipo: 'pessoa', status: 'ativo' },
    trabalhos: { etapa: 'recebido', rodadas: 0, links: {}, entra_no_portfolio: false },
    recebiveis: { status: 'a_receber' },
    contratos_mensais: { dia_vencimento: 1, ativo: true },
    servicos: { linha: 'edicao', unidade: 'video', preco: 0, ativo: true },
    categorias_video: { ordem: 0, ativo: true },
    despesas: { categoria: 'outros', recorrente: false },
    leads: { etapa: 'novo' },
    orcamentos: { status: 'rascunho', secoes: {}, itens: [], desconto: 0, total: 0 },
    tarefas: { feita: false },
    interacoes: { tipo: 'nota' },
  };

  function criarDemo() {
    const db = raiz.CRM.demonstracao.gerar(D.hojeISO());
    let seq = 0;
    const clonar = (x) => JSON.parse(JSON.stringify(x));
    const erro = (msg, code) => Object.assign(new Error(msg), { code });

    // Quais pagamentos ficariam sem nenhum vínculo se esta linha sumisse?
    function pagamentosOrfaos(tabela, id) {
      return (FILHOS[tabela] || []).filter(([t]) => t === 'recebiveis').some(([, col]) =>
        db.recebiveis.some((r) => r[col] === id &&
          !['cliente_id', 'projeto_id', 'trabalho_id', 'contrato_id'].filter((c) => c !== col).some((c) => r[c])));
    }

    return {
      modo: 'demo',
      auth: {
        async sessao() { return { email: 'demonstração', passo: 'ok' }; },
        async sair() { /* nada a encerrar */ },
      },
      async carregar() { return clonar(db); },
      async criar(tabela, dados) {
        if (!db[tabela]) throw erro('Tabela desconhecida: ' + tabela);
        if (tabela === 'recebiveis' && dados.chave_importacao &&
            db.recebiveis.some((r) => r.chave_importacao === dados.chave_importacao)) {
          throw erro('Importação duplicada', '23505');
        }
        const agora = new Date().toISOString();
        const linha = Object.assign({ id: 'demo-novo-' + (++seq) + '-' + Math.random().toString(36).slice(2, 6), criado_em: agora, atualizado_em: agora },
          clonar(PADROES[tabela] || {}), clonar(dados));
        db[tabela].push(linha);
        return clonar(linha);
      },
      async atualizar(tabela, id, mudancas) {
        const linha = db[tabela].find((x) => x.id === id);
        if (!linha) throw erro('Registro não encontrado');
        Object.assign(linha, clonar(mudancas), { atualizado_em: new Date().toISOString() });
        return clonar(linha);
      },
      async apagar(tabela, id) {
        if (pagamentosOrfaos(tabela, id)) {
          throw erro('Há pagamentos ligados só a este registro. Apague ou mude esses pagamentos antes.', '23514');
        }
        (FILHOS[tabela] || []).forEach(([t, col, acao]) => {
          if (acao === 'apagar') db[t] = db[t].filter((x) => x[col] !== id);
          else db[t].forEach((x) => { if (x[col] === id) x[col] = null; });
        });
        db[tabela] = db[tabela].filter((x) => x.id !== id);
      },
    };
  }

  // Carrega o supabase-js (versão fixa, com SRI) e depois o adaptador
  function carregarScript(src, integridade) {
    return new Promise((ok, falha) => {
      const s = document.createElement('script');
      s.src = src;
      if (integridade) { s.integrity = integridade; s.crossOrigin = 'anonymous'; }
      s.onload = ok;
      s.onerror = () => falha(new Error('Não consegui carregar ' + src));
      document.head.appendChild(s);
    });
  }

  const SUPABASE_JS = {
    src: 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/dist/umd/supabase.js',
    sri: 'sha384-KX6Y/AMIv9qA8TLCDul2JatZWeyrJVgj3Xu/0r30Nr05xO8md1+wHAgtdsRV9LoE',
  };

  raiz.CRM.iniciar = async function () {
    const c = raiz.CRM_CONFIG || {};
    if (c.supabaseUrl && c.supabaseAnonKey) {
      await carregarScript(SUPABASE_JS.src, SUPABASE_JS.sri);
      await carregarScript('crm/dados-supabase.js');
      return raiz.CRM.criarSupabase(c);
    }
    return criarDemo();
  };
})(window);
