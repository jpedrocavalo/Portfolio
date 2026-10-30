/* ════════════════════════════════════════════════════════════════
   CRM: ANÁLISE PARA OS GRÁFICOS (pura, sem tela)
   --------------------------------------------------------------
   Pega as "fatias" de receita (dominio.atribuirReceita) e agrupa por
   cliente, serviço, categoria de vídeo, projeto, mês e ano. Toda soma
   é feita em centavos: o total de qualquer agrupamento bate com o
   total filtrado.
   ════════════════════════════════════════════════════════════════ */
(function (raiz, fabrica) {
  const D = (typeof module === 'object' && module.exports) ? require('./dominio.js') : raiz.CRM.dominio;
  const api = fabrica(D);
  if (typeof module === 'object' && module.exports) module.exports = api;
  raiz.CRM = raiz.CRM || {};
  raiz.CRM.analise = api;
})(typeof window !== 'undefined' ? window : globalThis, function (D) {

  const DIMENSOES = {
    cliente:   { campo: 'cliente_id',   tabela: 'clientes',         vazio: 'Sem cliente',   nome: 'Cliente' },
    servico:   { campo: 'servico_id',   tabela: 'servicos',         vazio: 'Sem serviço',   nome: 'Serviço' },
    categoria: { campo: 'categoria_id', tabela: 'categorias_video', vazio: 'Sem categoria', nome: 'Categoria de vídeo' },
    projeto:   { campo: 'projeto_id',   tabela: 'projetos',         vazio: 'Sem projeto',   nome: 'Projeto' },
  };

  /**
   * filtros: { base: 'caixa' | 'previsto', de, ate (ISO, inclusivo),
   *            cliente_id, servico_id, categoria_id, projeto_id }
   * 'caixa' conta só o que já foi pago (data = dia do pagamento);
   * 'previsto' soma também o em aberto (data = vencimento).
   */
  function filtrar(fatias, f) {
    const o = f || {};
    return fatias.filter((x) => {
      if ((o.base || 'caixa') === 'caixa' && !x.realizado) return false;
      if (!x.data) return false;
      if (o.de && x.data < o.de) return false;
      if (o.ate && x.data > o.ate) return false;
      for (const campo of ['cliente_id', 'servico_id', 'categoria_id', 'projeto_id']) {
        if (o[campo] && x[campo] !== o[campo]) return false;
      }
      return true;
    });
  }

  const soma = (arr) => D.deCentavos(arr.reduce((s, x) => s + D.centavos(x.valor), 0));
  const videosDistintos = (arr) => new Set(arr.map((x) => x.trabalho_id).filter(Boolean)).size;

  // -> [{ chave, rotulo, valor, videos }] do maior para o menor
  function agrupar(fatias, dim, t) {
    const d = DIMENSOES[dim];
    const nomes = new Map((t[d.tabela] || []).map((x) => [x.id, x.nome]));
    const grupos = new Map();
    fatias.forEach((x) => {
      const k = x[d.campo] || '';
      if (!grupos.has(k)) grupos.set(k, []);
      grupos.get(k).push(x);
    });
    return [...grupos.entries()]
      .map(([k, arr]) => ({ chave: k, rotulo: k ? (nomes.get(k) || d.vazio) : d.vazio, valor: soma(arr), videos: videosDistintos(arr) }))
      .sort((a, b) => b.valor - a.valor);
  }

  // Todos os meses entre dois 'AAAA-MM', inclusive
  function listaMeses(de, ate) {
    const saida = [];
    for (let m = de; m <= ate; m = D.mesDe(D.addMeses(m + '-01', 1))) saida.push(m);
    return saida;
  }

  // -> [{ mes, valor, videos }] com TODOS os meses do intervalo (meses vazios = 0)
  function porMes(fatias, trabalhos, de, ate, filtros) {
    const f = filtros || {};
    const meses = listaMeses(de, ate);
    const val = new Map(meses.map((m) => [m, []]));
    fatias.forEach((x) => { const m = D.mesDe(x.data); if (val.has(m)) val.get(m).push(x); });
    const entregues = new Map(meses.map((m) => [m, 0]));
    (trabalhos || []).forEach((tr) => {
      if (!tr.entregue_em) return;
      if (f.cliente_id && tr.cliente_id !== f.cliente_id) return;
      if (f.servico_id && tr.servico_id !== f.servico_id) return;
      if (f.categoria_id && tr.categoria_id !== f.categoria_id) return;
      if (f.projeto_id && tr.projeto_id !== f.projeto_id) return;
      const m = D.mesDe(tr.entregue_em);
      if (entregues.has(m)) entregues.set(m, entregues.get(m) + 1);
    });
    return meses.map((m) => ({ mes: m, valor: soma(val.get(m)), videos: entregues.get(m) }));
  }

  // -> [{ ano, valor, videos }]
  function porAno(fatias, trabalhos, filtros) {
    const f = filtros || {};
    const anos = new Map();
    const pega = (a) => { if (!anos.has(a)) anos.set(a, { ano: a, fatias: [], videos: 0 }); return anos.get(a); };
    fatias.forEach((x) => pega(D.anoDe(x.data)).fatias.push(x));
    (trabalhos || []).forEach((tr) => {
      if (!tr.entregue_em) return;
      if (f.cliente_id && tr.cliente_id !== f.cliente_id) return;
      if (f.servico_id && tr.servico_id !== f.servico_id) return;
      if (f.categoria_id && tr.categoria_id !== f.categoria_id) return;
      if (f.projeto_id && tr.projeto_id !== f.projeto_id) return;
      pega(D.anoDe(tr.entregue_em)).videos++;
    });
    return [...anos.values()].sort((a, b) => a.ano - b.ano).map((x) => ({ ano: x.ano, valor: soma(x.fatias), videos: x.videos }));
  }

  return { DIMENSOES, filtrar, agrupar, porMes, porAno, listaMeses, soma };
});
