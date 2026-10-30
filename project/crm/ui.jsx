/* ════════════════════════════════════════════════════════════════
   CRM: PEÇAS DE TELA REUTILIZÁVEIS
   --------------------------------------------------------------
   Botão, cartão, tabela, janela, campos… e o contexto que dá a toda
   tela os dados (`t`), o dia de hoje e as ações de gravar.
   Exportado em window.CRMUI.
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useMemo, useEffect, useContext, createContext } = React;
  const D = window.CRM.dominio;

  const Ctx = createContext(null);
  const useCRM = () => useContext(Ctx);

  // ─── Rota por hash: #/clientes/abc  ->  ['clientes', 'abc'] ──────
  function lerRota() { return (location.hash.replace(/^#\/?/, '') || 'painel').split('/'); }
  function useRota() {
    const [rota, setRota] = useState(lerRota);
    useEffect(() => {
      const f = () => setRota(lerRota());
      window.addEventListener('hashchange', f);
      return () => window.removeEventListener('hashchange', f);
    }, []);
    return rota;
  }
  const ir = (caminho) => { location.hash = '#/' + caminho; };

  // ─── Índices por id, para as telas não ficarem procurando em lista ─
  function useIndices(t) {
    return useMemo(() => {
      const por = (arr) => new Map((arr || []).map((x) => [x.id, x]));
      return {
        cliente: por(t.clientes), projeto: por(t.projetos), trabalho: por(t.trabalhos),
        categoria: por(t.categorias_video), servico: por(t.servicos), contrato: por(t.contratos_mensais),
      };
    }, [t]);
  }
  const nomeDe = (mapa, id, vazio) => (id && mapa.get(id) ? (mapa.get(id).nome || mapa.get(id).titulo) : (vazio || ''));

  // ─── Botão, etiqueta, cartão ─────────────────────────────────────
  function Botao({ variante, peq, children, ...resto }) {
    const cls = 'crm-btn' + (variante ? ' ' + variante : '') + (peq ? ' peq' : '');
    return <button type="button" className={cls} {...resto}>{children}</button>;
  }
  const Tag = ({ tom, children }) => <span className={'crm-tag' + (tom ? ' ' + tom : '')}>{children}</span>;

  function Cartao({ titulo, acoes, semMargem, children }) {
    return (
      <section className="crm-cartao">
        {(titulo || acoes) && <header><h2>{titulo}</h2><div className="crm-acoes">{acoes}</div></header>}
        <div className={'corpo' + (semMargem ? ' sem' : '')}>{children}</div>
      </section>
    );
  }

  function Kpi({ rotulo, valor, sub, tom, barra }) {
    return (
      <div className={'crm-kpi' + (tom ? ' ' + tom : '')}>
        <div className="r">{rotulo}</div>
        <div className="v">{valor}</div>
        {sub && <div className="s">{sub}</div>}
        {barra != null && <div className={'crm-barra' + (barra > 0.9 ? ' alerta' : '')}><i style={{ width: Math.min(100, barra * 100) + '%' }} /></div>}
      </div>
    );
  }

  function Aviso({ tom, children }) { return <div className={'crm-aviso' + (tom ? ' ' + tom : '')}>{children}</div>; }

  // ─── Janela ──────────────────────────────────────────────────────
  function Modal({ titulo, aoFechar, rodape, larga, children }) {
    useEffect(() => {
      const f = (e) => { if (e.key === 'Escape') aoFechar(); };
      window.addEventListener('keydown', f);
      return () => window.removeEventListener('keydown', f);
    }, [aoFechar]);
    return (
      <div className="crm-fundo-modal" onMouseDown={(e) => { if (e.target === e.currentTarget) aoFechar(); }}>
        <div className={'crm-modal' + (larga ? ' larga' : '')} role="dialog" aria-label={titulo}>
          <header><h2>{titulo}</h2><Botao variante="texto" onClick={aoFechar} aria-label="Fechar">✕</Botao></header>
          <div className="corpo">{children}</div>
          {rodape && <footer>{rodape}</footer>}
        </div>
      </div>
    );
  }

  // ─── Campos ──────────────────────────────────────────────────────
  function Campo({ rotulo, dica, cheio, marca, children }) {
    return (
      <div className={'crm-campo' + (cheio ? ' cheio' : '') + (marca ? ' marca' : '')}>
        {rotulo && !marca && <label>{rotulo}</label>}
        {children}
        {rotulo && marca && <label>{rotulo}</label>}
        {dica && <span className="dica">{dica}</span>}
      </div>
    );
  }
  function Entrada({ rotulo, dica, cheio, valor, onChange, tipo, ...resto }) {
    return (
      <Campo rotulo={rotulo} dica={dica} cheio={cheio}>
        <input type={tipo || 'text'} value={valor == null ? '' : valor} onChange={(e) => onChange(e.target.value)} {...resto} />
      </Campo>
    );
  }
  function Area({ rotulo, dica, valor, onChange, ...resto }) {
    return (
      <Campo rotulo={rotulo} dica={dica} cheio>
        <textarea value={valor == null ? '' : valor} onChange={(e) => onChange(e.target.value)} {...resto} />
      </Campo>
    );
  }
  // opcoes: [{ v, r }]; `vazio` acrescenta uma primeira opção sem valor
  function Seletor({ rotulo, dica, cheio, valor, onChange, opcoes, vazio }) {
    return (
      <Campo rotulo={rotulo} dica={dica} cheio={cheio}>
        <select value={valor == null ? '' : valor} onChange={(e) => onChange(e.target.value)}>
          {vazio != null && <option value="">{vazio}</option>}
          {opcoes.map((o) => <option key={o.v} value={o.v}>{o.r}</option>)}
        </select>
      </Campo>
    );
  }
  function Caixa({ rotulo, valor, onChange }) {
    return (
      <Campo rotulo={rotulo} marca>
        <input type="checkbox" checked={!!valor} onChange={(e) => onChange(e.target.checked)} />
      </Campo>
    );
  }
  function Filtro({ rotulo, children }) {
    return <label className="crm-filtro"><span>{rotulo}</span>{children}</label>;
  }

  // ─── Tabela ──────────────────────────────────────────────────────
  // colunas: [{ id, titulo, render?(l), valor?(l), alinhar?, semOrdem? }]
  function Tabela({ colunas, linhas, aoClicar, vazio, ordemInicial, classeLinha }) {
    const [ordem, setOrdem] = useState(ordemInicial || null); // { id, dir }
    const ordenadas = useMemo(() => {
      if (!ordem) return linhas;
      const col = colunas.find((c) => c.id === ordem.id);
      if (!col) return linhas;
      const v = col.valor || ((l) => l[col.id]);
      return [...linhas].sort((a, b) => {
        const x = v(a), y = v(b);
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), 'pt-BR');
        return ordem.dir === 'desc' ? -r : r;
      });
    }, [linhas, ordem, colunas]);

    const clicar = (c) => {
      if (c.semOrdem) return;
      setOrdem((o) => (o && o.id === c.id ? { id: c.id, dir: o.dir === 'asc' ? 'desc' : 'asc' } : { id: c.id, dir: 'asc' }));
    };
    if (!linhas.length) return <div className="crm-vazio">{vazio || 'Nada por aqui ainda.'}</div>;
    return (
      <div className="crm-tabela-caixa">
        <table className="crm-tabela">
          <thead>
            <tr>
              {colunas.map((c) => (
                <th key={c.id} className={(c.semOrdem ? '' : 'ord ') + (c.alinhar || '')} onClick={() => clicar(c)}>
                  {c.titulo}{ordem && ordem.id === c.id ? (ordem.dir === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((l, i) => (
              <tr key={l.id || i} className={(aoClicar ? 'clicavel ' : '') + (classeLinha ? classeLinha(l) : '')} onClick={aoClicar ? () => aoClicar(l) : undefined}>
                {colunas.map((c) => <td key={c.id} className={c.alinhar || ''}>{c.render ? c.render(l) : l[c.id]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function Abas({ abas, ativa, aoMudar }) {
    return (
      <div className="crm-abas">
        {abas.map((a) => <button key={a.id} className={a.id === ativa ? 'ativa' : ''} onClick={() => aoMudar(a.id)}>{a.nome}</button>)}
      </div>
    );
  }

  // ─── Apresentação de recebíveis ──────────────────────────────────
  const TOM_STATUS = { pago: 'ok', atrasado: 'mal', a_receber: 'info', cancelado: 'mudo' };
  const NOME_STATUS = { pago: 'Pago', atrasado: 'Atrasado', a_receber: 'A receber', cancelado: 'Cancelado' };
  function TagStatus({ rec, hoje }) {
    const s = D.statusEfetivo(rec, hoje);
    return <Tag tom={TOM_STATUS[s]}>{NOME_STATUS[s]}</Tag>;
  }

  // Texto de WhatsApp com {cliente}, {valor}, {prazo}
  function preencherModelo(texto, vars) {
    return String(texto || '').replace(/\{(cliente|valor|prazo)\}/g, (_, k) => (vars[k] != null ? vars[k] : '{' + k + '}'));
  }

  window.CRMUI = {
    Ctx, useCRM, useRota, ir, useIndices, nomeDe,
    Botao, Tag, Cartao, Kpi, Aviso, Modal, Campo, Entrada, Area, Seletor, Caixa, Filtro, Tabela, Abas,
    TagStatus, NOME_STATUS, preencherModelo,
  };
})();
