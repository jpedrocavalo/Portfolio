/* ════════════════════════════════════════════════════════════════
   CRM: GRÁFICOS
   --------------------------------------------------------------
   Receita por cliente, serviço, categoria de vídeo, projeto, mês e
   ano, com filtros. "Recebido" conta o que já foi pago (no dia do
   pagamento); "Previsto" soma também o que está em aberto (no dia do
   vencimento). Os números vêm de dominio.atribuirReceita + analise.js.
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useMemo } = React;
  const D = window.CRM.dominio;
  const A = window.CRM.analise;
  const { useCRM, Cartao, Kpi, Filtro, Aviso } = window.CRMUI;
  const { Colunas, Rosca, BarrasH } = window.CRMGraf;

  function Graficos() {
    const { t, hoje } = useCRM();
    const [periodo, setPeriodo] = useState('12m');
    const [base, setBase] = useState('caixa');
    const [f, setF] = useState({ cliente_id: '', servico_id: '', categoria_id: '', projeto_id: '' });
    const setFiltro = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

    const r = useMemo(() => {
      const mesAtual = D.mesDe(hoje);
      const todas = D.atribuirReceita(t);
      const filtros = { ...f };
      Object.keys(filtros).forEach((k) => { if (!filtros[k]) delete filtros[k]; });

      const todasNoFiltro = A.filtrar(todas, { ...filtros, base });
      const datas = todasNoFiltro.map((x) => x.data).sort();
      let de, ate = mesAtual;
      if (periodo === '12m') de = D.mesDe(D.addMeses(mesAtual + '-01', -11));
      else if (periodo === 'ano') de = hoje.slice(0, 4) + '-01';
      else de = datas.length ? D.mesDe(datas[0]) : mesAtual;
      if (base === 'previsto' && datas.length && D.mesDe(datas[datas.length - 1]) > ate) ate = D.mesDe(datas[datas.length - 1]);

      const fatias = A.filtrar(todas, { ...filtros, base, de: de + '-01', ate: ate + '-31' });
      const porAno = A.porAno(A.filtrar(todas, { ...filtros, base }), t.trabalhos, filtros);
      const meses = A.porMes(fatias, t.trabalhos, de, ate, filtros);
      const total = A.soma(fatias);
      const videos = new Set(fatias.map((x) => x.trabalho_id).filter(Boolean)).size;
      return {
        de, ate, total, videos,
        meses, anos: porAno,
        clientes: A.agrupar(fatias, 'cliente', t),
        servicos: A.agrupar(fatias, 'servico', t),
        categorias: A.agrupar(fatias, 'categoria', t),
        projetos: A.agrupar(fatias, 'projeto', t),
        semVideo: A.soma(fatias.filter((x) => !x.trabalho_id)),
      };
    }, [t, hoje, periodo, base, f]);

    const rotuloMes = (m) => D.fmtMes(m).slice(0, 3) + (m.slice(5) === '01' || m === r.de ? '/' + m.slice(2, 4) : '');
    const top = (arr, n) => arr.slice(0, n).map((g) => ({ rotulo: g.rotulo, valor: g.valor, sub: g.videos ? g.videos + ' v.' : '' }));
    const sel = (k, tabela, rotulo) => (
      <Filtro rotulo={rotulo}>
        <select value={f[k]} onChange={setFiltro(k)}><option value="">Todos</option>{t[tabela].map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>
      </Filtro>
    );

    return (
      <div>
        <div className="crm-cabeca"><div><h1>Gráficos</h1><div className="sub">{D.fmtMes(r.de)} a {D.fmtMes(r.ate)} · {base === 'caixa' ? 'só o que já foi recebido' : 'recebido + a receber'}</div></div></div>

        <div className="crm-filtros">
          <Filtro rotulo="Período"><select value={periodo} onChange={(e) => setPeriodo(e.target.value)}><option value="12m">Últimos 12 meses</option><option value="ano">Este ano</option><option value="tudo">Tudo</option></select></Filtro>
          <Filtro rotulo="Valores"><select value={base} onChange={(e) => setBase(e.target.value)}><option value="caixa">Recebido</option><option value="previsto">Previsto (com a receber)</option></select></Filtro>
          {sel('cliente_id', 'clientes', 'Cliente')}
          {sel('servico_id', 'servicos', 'Serviço')}
          {sel('categoria_id', 'categorias_video', 'Categoria')}
          {sel('projeto_id', 'projetos', 'Projeto')}
        </div>

        <div className="crm-grade c3" style={{ marginBottom: 14 }}>
          <Kpi rotulo="Receita no período" valor={D.fmtBRL(r.total)} />
          <Kpi rotulo="Vídeos com receita" valor={r.videos} sub={r.videos ? D.fmtBRL((r.total - r.semVideo) / r.videos) + ' por vídeo' : ''} />
          <Kpi rotulo="Sem vídeo ligado" valor={D.fmtBRL(r.semVideo)} sub="mensalidade de mês sem entrega, ou pagamento só do cliente" />
        </div>

        <div className="crm-grade c2">
          <Cartao titulo="Por mês">
            <Colunas dados={r.meses.map((m) => ({ rotulo: rotuloMes(m.mes), valor: m.valor, linha: m.videos }))} nomeLinha="vídeos entregues" />
          </Cartao>
          <Cartao titulo="Por ano (todo o histórico)">
            <Colunas dados={r.anos.map((a) => ({ rotulo: String(a.ano), valor: a.valor, linha: a.videos }))} nomeLinha="vídeos entregues" />
          </Cartao>
        </div>

        <div className="crm-grade c2">
          <Cartao titulo="Por cliente"><BarrasH dados={top(r.clientes, 10)} /></Cartao>
          <Cartao titulo="Por projeto"><BarrasH dados={top(r.projetos.filter((p) => p.chave), 10)} /></Cartao>
        </div>

        <div className="crm-grade c2">
          <Cartao titulo="Por categoria de vídeo"><Rosca dados={r.categorias.map((g) => ({ rotulo: g.rotulo, valor: g.valor }))} /></Cartao>
          <Cartao titulo="Por serviço"><Rosca dados={r.servicos.map((g) => ({ rotulo: g.rotulo, valor: g.valor }))} /></Cartao>
        </div>

        <div className="crm-pequeno crm-mudo">
          Como a receita é repartida: um pagamento de projeto se divide igualmente entre os vídeos do projeto; a mensalidade se divide entre os vídeos
          que o cliente teve entregues naquele mês; mês sem entrega aparece como "Sem categoria/serviço/projeto". A soma de cada gráfico sempre fecha com o total.
        </div>
      </div>
    );
  }

  window.CRMTelas = window.CRMTelas || {};
  window.CRMTelas.Graficos = Graficos;
})();
