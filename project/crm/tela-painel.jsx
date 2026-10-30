/* ════════════════════════════════════════════════════════════════
   CRM: PAINEL (o que olhar toda manhã)
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useMemo } = React;
  const D = window.CRM.dominio;
  const A = window.CRM.analise;
  const { useCRM, ir, Cartao, Kpi, Tag, Botao, Tabela, TagStatus } = window.CRMUI;
  const { Colunas, Rosca, BarrasH } = window.CRMGraf;

  const cfgDe = (t, chave) => { const c = t.config.find((x) => x.chave === chave); return c ? c.valor : null; };

  function Painel() {
    const { t, hoje } = useCRM();
    const mes = D.mesDe(hoje);
    const dados = useMemo(() => {
      const resumo = D.resumoDoMes(t, mes, hoje);
      const fatias = D.atribuirReceita(t);
      const de = D.mesDe(D.addMeses(mes + '-01', -11));
      const periodo = A.filtrar(fatias, { base: 'caixa', de: de + '-01', ate: hoje });
      const limite = +cfgDe(t, 'mei_limite') || null;
      const metaMes = t.metas.find((m) => m.periodo === mes && m.tipo === 'receita');
      return {
        resumo, limite,
        ano: D.acumuladoDoAno(t, D.anoDe(hoje), limite),
        meta: metaMes ? +metaMes.valor : null,
        meses: A.porMes(periodo, t.trabalhos, de, mes),
        categorias: A.agrupar(periodo, 'categoria', t),
        clientes: A.agrupar(periodo, 'cliente', t).slice(0, 6),
      };
    }, [t, mes, hoje]);

    const cliente = (id) => (t.clientes.find((c) => c.id === id) || {}).nome || '';
    const abertos = t.recebiveis
      .filter((r) => r.status === 'a_receber' && r.vencimento <= D.addDias(hoje, 7))
      .sort((a, b) => a.vencimento.localeCompare(b.vencimento));
    const prazos = t.trabalhos
      .filter((x) => !['entregue', 'pago'].includes(x.etapa) && x.prazo)
      .sort((a, b) => a.prazo.localeCompare(b.prazo)).slice(0, 8);
    const tarefas = t.tarefas.filter((x) => !x.feita && x.para && x.para <= D.addDias(hoje, 1))
      .sort((a, b) => a.para.localeCompare(b.para));

    const { resumo: r, ano, meta } = dados;
    return (
      <div>
        <div className="crm-cabeca">
          <div><h1>Painel</h1><div className="sub">{D.fmtMes(mes)} · hoje é {D.fmtData(hoje)}</div></div>
        </div>

        <div className="crm-grade c6" style={{ marginBottom: 14 }}>
          <Kpi rotulo="Recebido no mês" valor={D.fmtBRL(r.recebido)} sub={r.qtdRecebidos + ' pagamentos'} barra={meta ? r.recebido / meta : undefined} />
          <Kpi rotulo="Previsto no mês" valor={D.fmtBRL(r.previstoNoMes)} sub="ainda em aberto" />
          <Kpi rotulo="Atrasado" valor={D.fmtBRL(r.atrasado)} sub={r.qtdAtrasados + (r.qtdAtrasados === 1 ? ' pagamento' : ' pagamentos')} tom={r.atrasado > 0 ? 'mal' : ''} />
          <Kpi rotulo="A receber em 30 dias" valor={D.fmtBRL(r.aReceber30d)} />
          <Kpi rotulo="Entregues no mês" valor={r.entregues} sub={r.emAndamento + ' em andamento'} />
          <Kpi rotulo={'Limite do MEI ' + D.anoDe(hoje)} valor={D.fmtBRL(ano.total)} sub={ano.limite ? Math.round(ano.pct * 100) + '% de ' + D.fmtBRL(ano.limite) : 'defina o limite em Configurações'} barra={ano.pct == null ? undefined : ano.pct} />
        </div>
        {meta && <div className="crm-pequeno crm-mudo" style={{ margin: '-6px 0 14px' }}>Meta do mês: {D.fmtBRL(meta)} · faltam {D.fmtBRL(Math.max(0, meta - r.recebido))}</div>}

        <div className="crm-grade c2">
          <Cartao titulo="Receita por mês (12 meses)" acoes={<Botao variante="texto" peq onClick={() => ir('graficos')}>ver gráficos</Botao>}>
            <Colunas dados={dados.meses.map((m) => ({ rotulo: D.fmtMes(m.mes).slice(0, 3), valor: m.valor, linha: m.videos }))} nomeLinha="vídeos entregues" />
          </Cartao>
          <Cartao titulo="Por categoria de vídeo (12 meses)">
            <Rosca dados={dados.categorias.map((c) => ({ rotulo: c.rotulo, valor: c.valor }))} />
          </Cartao>
        </div>

        <div className="crm-grade c2">
          <Cartao titulo="Maiores clientes (12 meses)">
            <BarrasH dados={dados.clientes.map((c) => ({ rotulo: c.rotulo, valor: c.valor, sub: c.videos + ' v.' }))} />
          </Cartao>
          <Cartao titulo="Cobranças da semana" acoes={<Botao variante="texto" peq onClick={() => ir('financeiro')}>financeiro</Botao>} semMargem>
            <Tabela
              vazio="Nada vencendo nos próximos 7 dias."
              linhas={abertos}
              aoClicar={() => ir('financeiro')}
              colunas={[
                { id: 'vencimento', titulo: 'Vence', render: (x) => D.fmtData(x.vencimento) },
                { id: 'cliente', titulo: 'Cliente', render: (x) => cliente(x.cliente_id), valor: (x) => cliente(x.cliente_id) },
                { id: 'valor', titulo: 'Valor', alinhar: 'dir', render: (x) => D.fmtBRL(x.valor), valor: (x) => +x.valor },
                { id: 'status', titulo: '', semOrdem: true, render: (x) => <TagStatus rec={x} hoje={hoje} /> },
              ]}
            />
          </Cartao>
        </div>

        <div className="crm-grade c2">
          <Cartao titulo="Próximos prazos" acoes={<Botao variante="texto" peq onClick={() => ir('trabalhos')}>trabalhos</Botao>} semMargem>
            <Tabela
              vazio="Nenhum trabalho em andamento."
              linhas={prazos}
              aoClicar={() => ir('trabalhos')}
              colunas={[
                { id: 'prazo', titulo: 'Prazo', render: (x) => <span className={x.prazo < hoje ? 'crm-tag mal' : ''}>{D.fmtData(x.prazo)}</span> },
                { id: 'titulo', titulo: 'Vídeo' },
                { id: 'cliente', titulo: 'Cliente', render: (x) => cliente(x.cliente_id), valor: (x) => cliente(x.cliente_id) },
                { id: 'etapa', titulo: 'Etapa', render: (x) => <Tag>{(D.ETAPAS.find((e) => e.id === x.etapa) || {}).nome}</Tag> },
              ]}
            />
          </Cartao>
          <Cartao titulo="Tarefas de hoje e atrasadas" acoes={<Botao variante="texto" peq onClick={() => ir('tarefas')}>tarefas</Botao>} semMargem>
            {tarefas.length ? (
              <ul className="crm-lista-simples">
                {tarefas.map((x) => (
                  <li key={x.id}>
                    <span className="gr">{x.titulo}{x.cliente_id ? <small>{cliente(x.cliente_id)}</small> : null}</span>
                    <span className={x.para < hoje ? 'crm-tag mal' : 'crm-tag'}>{x.para < hoje ? 'atrasada · ' : ''}{D.fmtData(x.para)}</span>
                  </li>
                ))}
              </ul>
            ) : <div className="crm-vazio">Nada para hoje.</div>}
          </Cartao>
        </div>
      </div>
    );
  }

  window.CRMTelas = window.CRMTelas || {};
  window.CRMTelas.Painel = Painel;
})();
