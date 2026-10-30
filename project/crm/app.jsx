/* ════════════════════════════════════════════════════════════════
   CRM: CASCA DO APP
   --------------------------------------------------------------
   Escolhe o modo (demonstração ou Supabase), cuida do login, carrega
   os dados, entrega tudo às telas pelo contexto e faz o roteamento
   por hash (#/painel, #/clientes/<id>, …).
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useEffect, useCallback, useMemo } = React;
  const D = window.CRM.dominio;
  const { Ctx, useRota, ir, Aviso, Botao } = window.CRMUI;

  const NAV = [
    { id: 'painel', nome: 'Painel' },
    { id: 'graficos', nome: 'Gráficos' },
    { id: 'clientes', nome: 'Clientes' },
    { id: 'trabalhos', nome: 'Trabalhos' },
    { id: 'financeiro', nome: 'Financeiro' },
    { id: 'tarefas', nome: 'Tarefas' },
    { id: 'importar', nome: 'Importar' },
    { id: 'config', nome: 'Configurações' },
  ];

  function App() {
    const [dados, setDados] = useState(null);
    const [sessao, setSessao] = useState(undefined); // undefined = ainda verificando
    const [t, setT] = useState(null);
    const [erro, setErro] = useState('');
    const rota = useRota();
    const hoje = D.hojeISO();

    // 1) escolhe o modo e vê se já há sessão
    useEffect(() => {
      document.title = 'CRM';
      window.CRM.iniciar()
        .then(async (d) => { setDados(d); setSessao(await d.auth.sessao()); })
        .catch((e) => setErro(e.message || String(e)));
    }, []);

    const carregar = useCallback(async (d) => {
      try { setT(await (d || dados).carregar()); setErro(''); } catch (e) { setErro(e.message || String(e)); }
    }, [dados]);

    // 2) com sessão completa, carrega os dados
    useEffect(() => { if (dados && sessao && sessao.passo === 'ok') carregar(dados); }, [dados, sessao]);

    useEffect(() => { window.scrollTo(0, 0); }, [rota[0], rota[1]]);

    const ctx = useMemo(() => {
      if (!dados || !t) return null;
      // Mudanças locais para a tela reagir já; só apagar recarrega (por causa das cascatas)
      const criar = async (tabela, linha) => {
        const nova = await dados.criar(tabela, linha);
        setT((p) => ({ ...p, [tabela]: [...p[tabela], nova] }));
        return nova;
      };
      const atualizar = async (tabela, id, mudancas) => {
        const nova = await dados.atualizar(tabela, id, mudancas);
        setT((p) => ({ ...p, [tabela]: p[tabela].map((x) => (x.id === id ? nova : x)) }));
        return nova;
      };
      const apagar = async (tabela, id, detalhe) => {
        await dados.apagar(tabela, id);
        await carregar();
        // Registro de ações (só se acrescenta)
        try { await dados.criar('auditoria', { acao: 'apagar', tabela, registro_id: String(id).length === 36 ? id : null, detalhe: detalhe || {} }); } catch (_) { /* não bloqueia */ }
      };
      // Executa uma ação e mostra o erro em vez de quebrar a tela
      const agir = async (fn) => {
        try { await fn(); setErro(''); return true; } catch (e) { setErro(e.message || String(e)); return false; }
      };
      return { t, hoje, modo: dados.modo, dados, criar, atualizar, apagar, agir, recarregar: () => carregar(), erro, setErro };
    }, [dados, t, hoje, erro, carregar]);

    if (erro && !dados) {
      return <div className="crm-login"><div className="caixa"><h1>CRM</h1><Aviso tom="erro">{erro}</Aviso></div></div>;
    }
    if (!dados || sessao === undefined) return <div className="crm-carregando">Carregando…</div>;
    if (!sessao || sessao.passo !== 'ok') {
      const Login = window.CRMTelas.Login;
      return <Login dados={dados} sessao={sessao} aoConcluir={async () => setSessao(await dados.auth.sessao())} />;
    }
    if (!ctx) return <div className="crm-carregando">{erro ? <Aviso tom="erro">{erro}</Aviso> : 'Carregando dados…'}</div>;

    const T = window.CRMTelas;
    const telas = { painel: T.Painel, graficos: T.Graficos, clientes: T.Clientes, trabalhos: T.Trabalhos, financeiro: T.Financeiro, tarefas: T.Tarefas, importar: T.Importar, config: T.Config };
    const Tela = telas[rota[0]] || T.Painel;

    const contagens = {
      clientes: t.clientes.filter((c) => c.status !== 'inativo').length,
      trabalhos: t.trabalhos.filter((x) => !['entregue', 'pago'].includes(x.etapa)).length,
      financeiro: t.recebiveis.filter((r) => D.statusEfetivo(r, hoje) === 'atrasado').length,
      tarefas: t.tarefas.filter((x) => !x.feita).length,
    };

    return (
      <Ctx.Provider value={ctx}>
        <div className="crm-app">
          <aside className="crm-lateral">
            <div className="crm-marca">CRM<small>serviços</small></div>
            <nav className="crm-nav">
              {NAV.map((n) => (
                <a key={n.id} className={rota[0] === n.id || (!rota[0] && n.id === 'painel') ? 'ativo' : ''} href={'#/' + n.id}>
                  {n.nome}{contagens[n.id] ? <span className="n" style={n.id === 'financeiro' ? { color: 'var(--mal)' } : null}>{contagens[n.id]}</span> : null}
                </a>
              ))}
            </nav>
            <div className="rodape">
              {sessao.email}
              {dados.modo === 'supabase' && <div><Botao variante="contorno" peq onClick={async () => { await dados.auth.sair(); setT(null); setSessao(null); }}>Sair</Botao></div>}
            </div>
          </aside>
          <main className="crm-principal">
            {dados.modo === 'demo' && <div className="crm-faixa-demo">Modo demonstração · dados fictícios · nada é salvo</div>}
            <div className="crm-conteudo">
              {erro && (
                <Aviso tom="erro">
                  <div className="crm-linha crm-sp"><span>{erro}</span><Botao variante="texto" peq onClick={() => ctx.setErro('')}>fechar</Botao></div>
                </Aviso>
              )}
              <Tela rota={rota} />
            </div>
          </main>
        </div>
      </Ctx.Provider>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
