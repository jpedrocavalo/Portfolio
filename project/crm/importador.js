/* ════════════════════════════════════════════════════════════════
   CRM: IMPORTADOR DA PLANILHA "ENTRADAS"
   --------------------------------------------------------------
   Funções puras (sem tela, sem banco), para rodar no navegador
   (window.CRM.importador) e no Node (testes).

   A planilha é uma lista de entradas de caixa: Data, Nome, Categoria,
   Valor, Mês. Não há coluna de cliente, projeto nem vídeo: está tudo
   escrito junto no Nome ("Casamento Fulano Produções"). O importador:

     1. lerTabela     texto colado do Sheets (TSV) ou CSV -> tabela
     2. classificar   só Categoria = Edição; deduz cliente, projeto,
                      vídeo e categoria; marca dúvidas
     3. resumo        contagens e somas, inclusive do que ficou de fora
     4. montarPlano   as gravações que a importação faria (sem gravar)
     5. executarPlano grava de verdade, depois do "Confirmar importação"

   A lista de clientes chega SEMPRE por parâmetro. Nada aqui conhece
   cliente real.
   ════════════════════════════════════════════════════════════════ */
(function (raiz, fabrica) {
  const D = (typeof module === 'object' && module.exports) ? require('./dominio.js') : raiz.CRM.dominio;
  const api = fabrica(D);
  if (typeof module === 'object' && module.exports) module.exports = api;
  raiz.CRM = raiz.CRM || {};
  raiz.CRM.importador = api;
})(typeof window !== 'undefined' ? window : globalThis, function (D) {

  const { semAcento } = D;

  // ─── 1. Ler a tabela ───────────────────────────────────────────
  // Aceita TSV (colar do Google Sheets) e CSV com vírgula ou ponto e
  // vírgula, com aspas ("R$ 1.234,56").
  function dividirCampos(texto, delim) {
    const linhas = [];
    let campo = '', linha = [], aspas = false;
    for (let i = 0; i < texto.length; i++) {
      const c = texto[i];
      if (aspas) {
        if (c === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
        else if (c === '"') aspas = false;
        else campo += c;
      } else if (c === '"' && campo === '') {
        aspas = true;
      } else if (c === delim) {
        linha.push(campo); campo = '';
      } else if (c === '\n' || c === '\r') {
        if (c === '\r' && texto[i + 1] === '\n') i++;
        linha.push(campo); campo = '';
        linhas.push(linha); linha = [];
      } else {
        campo += c;
      }
    }
    if (campo !== '' || linha.length) { linha.push(campo); linhas.push(linha); }
    return linhas;
  }

  const CABECALHOS = {
    data: /^data$/, nome: /^(nome|descricao|historico)$/,
    categoria: /^(categoria|tipo|servico)$/, valor: /^(valor|preco|total)$/, mes: /^mes$/,
  };

  // -> { linhas: [{ n, data, nome, categoria, valor, mes }], aviso }
  function lerTabela(texto) {
    const t = String(texto == null ? '' : texto).replace(/^﻿/, '');
    const primeira = t.split(/\r?\n/).find((l) => l.trim()) || '';
    const delim = primeira.includes('\t') ? '\t'
      : ((primeira.match(/;/g) || []).length > (primeira.match(/,/g) || []).length ? ';' : ',');
    const brutas = dividirCampos(t, delim).filter((l) => l.some((c) => String(c).trim() !== ''));
    if (!brutas.length) return { linhas: [], aviso: 'Nada para ler.' };

    // Há cabeçalho? Se a 1ª célula já é uma data, não há.
    const temCabecalho = !D.parseDataBR(String(brutas[0][0]).trim());
    let col = { data: 0, nome: 1, categoria: 2, valor: 3, mes: 4 };
    let corpo = brutas;
    if (temCabecalho) {
      const mapa = {};
      brutas[0].forEach((h, i) => {
        const nome = semAcento(h).replace(/[^a-z]/g, '');
        for (const [campo, re] of Object.entries(CABECALHOS)) if (re.test(nome) && mapa[campo] === undefined) mapa[campo] = i;
      });
      if (mapa.data === undefined || mapa.nome === undefined || mapa.valor === undefined) {
        return { linhas: [], aviso: 'Não achei as colunas Data, Nome e Valor no cabeçalho.' };
      }
      col = { categoria: -1, mes: -1, ...mapa };
      corpo = brutas.slice(1);
    }
    const pega = (l, i) => (i >= 0 && i < l.length ? String(l[i]).trim() : '');
    const linhas = corpo.map((l, i) => ({
      n: i + 1,
      data: pega(l, col.data), nome: pega(l, col.nome), categoria: pega(l, col.categoria),
      valor: pega(l, col.valor), mes: pega(l, col.mes),
    }));
    return { linhas, aviso: null };
  }

  // ─── 2. Classificar ────────────────────────────────────────────
  // Palavra-chave do texto -> categoria de vídeo sugerida
  const PALAVRAS_CATEGORIA = [
    [/making\s*of/, 'Making of'],
    [/pre[\s-]*wedding|prewedding/, 'Pre wedding'],
    [/aftermovie|after\s*movie/, 'Aftermovie'],
    [/casament|wedding|noiv/, 'Casamento'],
    [/formatura/, 'Formatura'],
    [/imobili|imovel|imoveis/, 'Imobiliário'],
    [/podcast/, 'Podcast'],
    [/reels?\b|\bcorte/, 'Corte e Reels'],
    [/clipe/, 'Clipe'],
    [/institucional/, 'Institucional'],
    [/real\s*time/, 'Real Time'],
    [/evento|desfile|festival|congresso/, 'Evento'],
  ];

  // Textos que não parecem edição de vídeo: viram dúvida
  const NAO_PARECE_VIDEO = /mentoria|curso|aula\b|reembolso|estorno|emprestimo|\bsite\b|\bsites\b/;

  const capitalizar = (s) => {
    const t = String(s || '').trim();
    // Só mexe se estiver tudo em minúsculo; "PROJETO ALFA" e "Festival Exemplo" ficam
    return t === t.toLowerCase() ? t.replace(/(^|\s)(\S)/g, (_, a, b) => a + b.toUpperCase()) : t;
  };

  // Acha, no FIM do texto, o cliente de nome mais longo. -> { cliente, resto } | null
  function acharCliente(nome, clientes) {
    const n = semAcento(nome);
    let melhor = null;
    for (const c of clientes || []) {
      for (const alvo of [c.nome, ...(c.aliases || [])]) {
        const a = semAcento(alvo);
        if (!a) continue;
        if (n === a || n.endsWith(' ' + a)) {
          if (!melhor || a.length > melhor.len) melhor = { cliente: c, len: a.length, inteiro: n === a };
        }
      }
    }
    if (!melhor) return null;
    const bruto = String(nome).trim();
    const restoNorm = melhor.inteiro ? '' : bruto.slice(0, bruto.length - melhor.len).trim();
    return { cliente: melhor.cliente, resto: restoNorm };
  }

  function lerPadrao(resto) {
    const r = semAcento(resto);
    let m;
    if (/^mensal(idade)?$/.test(r)) return { padrao: 'mensal', descricao: '' };
    if ((m = /^(\d+)\s+videos?\b\s*(.*)$/.exec(r))) {
      const depois = String(resto).trim().replace(/^\d+\s+\S+\s*/, '');
      return { padrao: 'lote', lote: +m[1], descricao: depois };
    }
    if ((m = /^real\s*time\b\s*(.*)$/.exec(r))) {
      const depois = String(resto).trim().replace(/^real\s*time\s*/i, '');
      return { padrao: 'real_time', descricao: depois, projeto: depois };
    }
    if ((m = /^dia\s+(\d+)\b\s*(.*)$/.exec(r))) {
      const depois = String(resto).trim().replace(/^dia\s+\d+\s*/i, '');
      return { padrao: 'dia', dia: +m[1], descricao: depois, projeto: depois, video: 'Dia ' + m[1] };
    }
    return { padrao: null, descricao: String(resto).trim() };
  }

  function sugerirCategoria(texto, categoriasVideo) {
    const t = semAcento(texto);
    for (const [re, nome] of PALAVRAS_CATEGORIA) {
      if (!re.test(t)) continue;
      if (!categoriasVideo || !categoriasVideo.length) return nome;
      const igual = categoriasVideo.find((c) => semAcento(c) === semAcento(nome));
      if (igual) return igual;
    }
    return '';
  }

  const mediana = (arr) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b), m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  };

  /**
   * @param {{linhas}} tabela     saída de lerTabela
   * @param {object}   opcoes
   *   clientes:          [{ nome, aliases? }]
   *   categoriasVideo:   ['Casamento', ...]
   *   projetosConhecidos:['Nome do projeto', ...]
   *   categoriaAlvo:     'edicao' (o que importar; comparação sem acento)
   * @returns linhas classificadas
   */
  function classificar(tabela, opcoes) {
    const o = Object.assign({ clientes: [], categoriasVideo: [], projetosConhecidos: [], categoriaAlvo: 'edicao' }, opcoes);
    const projetos = new Set(o.projetosConhecidos.map(semAcento));
    const vistas = new Map(); // chave-base -> quantas vezes já apareceu

    const saida = tabela.linhas.map((b) => {
      const iso = D.parseDataBR(b.data);
      const valor = D.parseBRL(b.valor);
      const cat = semAcento(b.categoria);
      const l = {
        n: b.n, bruto: b, data: iso, valor,
        categoriaPlanilha: b.categoria,
        escopo: true, motivoIgnorada: null,
        clienteNome: '', descricao: '', padrao: null, lote: 0,
        projetoNome: '', videoTitulo: '', categoriaNome: '',
        duvidas: [], avisos: [], incluir: false, chave: null,
      };

      // Fora do escopo: nunca some sem aviso, fica registrada com o motivo
      if (!iso) { l.escopo = false; l.motivoIgnorada = 'data inválida'; return l; }
      if (!Number.isFinite(valor)) { l.escopo = false; l.motivoIgnorada = 'valor inválido'; return l; }
      if (!cat) { l.escopo = false; l.motivoIgnorada = 'sem categoria'; return l; }
      if (cat !== semAcento(o.categoriaAlvo)) { l.escopo = false; l.motivoIgnorada = 'categoria: ' + b.categoria; return l; }

      // Chave de deduplicação: data + nome + valor, com contador para
      // entradas legitimamente idênticas no mesmo dia.
      const base = iso + '|' + semAcento(b.nome) + '|' + D.centavos(valor);
      const k = (vistas.get(base) || 0) + 1;
      vistas.set(base, k);
      l.chave = base + '#' + k;

      const achou = acharCliente(b.nome, o.clientes);
      const resto = achou ? achou.resto : String(b.nome).trim();
      if (achou) l.clienteNome = achou.cliente.nome; else l.duvidas.push('cliente não reconhecido');

      const p = lerPadrao(resto);
      l.padrao = p.padrao;
      l.lote = p.lote || 0;
      l.descricao = capitalizar(p.descricao);
      l.projetoNome = capitalizar(p.projeto || '');
      l.videoTitulo = p.video || '';

      // Um texto que já é o nome de um projeto conhecido é pagamento do projeto
      if (!l.projetoNome && l.descricao && projetos.has(semAcento(l.descricao))) {
        l.projetoNome = o.projetosConhecidos.find((x) => semAcento(x) === semAcento(l.descricao));
      }
      // "real time X" onde X é um projeto conhecido: respeita a grafia conhecida
      if (l.projetoNome && projetos.has(semAcento(l.projetoNome))) {
        l.projetoNome = o.projetosConhecidos.find((x) => semAcento(x) === semAcento(l.projetoNome));
      }

      l.categoriaNome = sugerirCategoria(resto, o.categoriasVideo);
      if (p.padrao === 'real_time' && !l.categoriaNome) l.categoriaNome = sugerirCategoria('real time', o.categoriasVideo);

      if (NAO_PARECE_VIDEO.test(semAcento(b.nome))) l.duvidas.push('o texto não parece edição de vídeo');
      if (l.padrao === 'mensal' && !achou) l.duvidas.push('mensalidade sem cliente reconhecido');
      if (!l.descricao && !l.projetoNome && !l.padrao) l.avisos.push('entrada sem título');

      l.incluir = l.duvidas.length === 0;
      return l;
    });

    // Projetos que a própria planilha revela ("real time X", "dia N X"):
    // as outras entradas do mesmo cliente com o texto "X" são pagamentos
    // desse mesmo projeto, não vídeos soltos.
    const deduzidos = new Map();
    saida.forEach((l) => {
      if (l.escopo && l.clienteNome && l.projetoNome && (l.padrao === 'real_time' || l.padrao === 'dia')) {
        deduzidos.set(l.clienteNome + '|' + semAcento(l.projetoNome), l.projetoNome);
      }
    });
    saida.forEach((l) => {
      if (!l.escopo || l.projetoNome || l.padrao || !l.descricao) return;
      const achado = deduzidos.get(l.clienteNome + '|' + semAcento(l.descricao));
      if (achado) l.projetoNome = achado;
    });

    // Aviso (não bloqueia): valor bem acima do usual do cliente
    const porCliente = new Map();
    saida.filter((l) => l.escopo && l.clienteNome).forEach((l) => {
      if (!porCliente.has(l.clienteNome)) porCliente.set(l.clienteNome, []);
      porCliente.get(l.clienteNome).push(l.valor);
    });
    saida.forEach((l) => {
      const vs = porCliente.get(l.clienteNome);
      if (!l.escopo || !vs || vs.length < 4 || l.padrao === 'mensal') return;
      if (l.valor > 4 * mediana(vs)) l.avisos.push('valor bem acima do usual deste cliente (projeto ou lote?)');
    });
    return saida;
  }

  // ─── 3. Resumo ─────────────────────────────────────────────────
  function resumo(linhas) {
    const r = {
      total: linhas.length,
      incluidas: { n: 0, soma: 0, porMes: {} },
      duvidas: { n: 0, soma: 0 },
      ignoradas: { n: 0, soma: 0, porMotivo: {} },
    };
    const cent = (v) => (Number.isFinite(v) ? D.centavos(v) : 0);
    let sIn = 0, sDu = 0, sIg = 0;
    const motivos = {};
    const meses = {};
    linhas.forEach((l) => {
      if (!l.escopo) {
        r.ignoradas.n++; sIg += cent(l.valor);
        const m = motivos[l.motivoIgnorada] || (motivos[l.motivoIgnorada] = { n: 0, c: 0 });
        m.n++; m.c += cent(l.valor);
      } else if (l.incluir) {
        r.incluidas.n++; sIn += cent(l.valor);
        const mes = D.mesDe(l.data);
        meses[mes] = (meses[mes] || 0) + cent(l.valor);
      } else {
        r.duvidas.n++; sDu += cent(l.valor);
      }
    });
    r.incluidas.soma = D.deCentavos(sIn);
    r.duvidas.soma = D.deCentavos(sDu);
    r.ignoradas.soma = D.deCentavos(sIg);
    Object.keys(meses).sort().forEach((m) => { r.incluidas.porMes[m] = D.deCentavos(meses[m]); });
    Object.keys(motivos).forEach((m) => { r.ignoradas.porMotivo[m] = { n: motivos[m].n, soma: D.deCentavos(motivos[m].c) }; });
    return r;
  }

  // ─── 4. Plano de gravação ──────────────────────────────────────
  // Devolve as operações na ordem certa (cliente, projeto, contrato,
  // trabalho, recebível). Referências a coisas que ainda serão criadas
  // vão como 'tmp:<nome>' e são trocadas pelos ids reais ao executar.
  function montarPlano(linhas, existentes, opcoes) {
    const ex = Object.assign({ clientes: [], projetos: [], contratos_mensais: [], recebiveis: [] }, existentes);
    const o = Object.assign({ tipoClienteNovo: 'pessoa' }, opcoes);
    const ops = [];
    let seq = 0;
    const tmp = (p) => 'tmp:' + p + '_' + (++seq);

    const jaTem = new Set(ex.recebiveis.map((r) => r.chave_importacao).filter(Boolean));
    const clientes = new Map(ex.clientes.map((c) => [semAcento(c.nome), c.id]));
    const projetos = new Map(ex.projetos.map((p) => [(p.cliente_id || '') + '|' + semAcento(p.nome), p.id]));
    const contratos = new Map(ex.contratos_mensais.map((c) => [c.cliente_id, c.id]));

    const novos = { clientes: 0, projetos: 0, contratos: 0, trabalhos: 0, recebiveis: 0, soma: 0 };
    let jaImportadas = 0;
    let semCliente = 0;
    let somaCent = 0;

    const garantirCliente = (nome) => {
      const chave = semAcento(nome);
      if (!nome) return null;
      if (!clientes.has(chave)) {
        const id = tmp('cliente');
        clientes.set(chave, id);
        ops.push({ tabela: 'clientes', tmp: id, dados: { nome, tipo: o.tipoClienteNovo, status: 'ativo', origem: 'importação da planilha' } });
        novos.clientes++;
      }
      return clientes.get(chave);
    };

    const garantirProjeto = (clienteId, nome) => {
      const chave = (clienteId || '') + '|' + semAcento(nome);
      if (!projetos.has(chave)) {
        const id = tmp('projeto');
        projetos.set(chave, id);
        ops.push({ tabela: 'projetos', tmp: id, dados: { cliente_id: clienteId, nome } });
        novos.projetos++;
      }
      return projetos.get(chave);
    };

    const garantirContrato = (clienteId, l) => {
      if (!contratos.has(clienteId)) {
        const id = tmp('contrato');
        contratos.set(clienteId, id);
        const dia = Math.min(+l.data.slice(8, 10), 28);
        const inicio = D.mesDe(l.data) + '-01';
        ops.push({ tabela: 'contratos_mensais', tmp: id, dados: { cliente_id: clienteId, valor_mensal: l.valor, dia_vencimento: dia, inicio, ativo: true } });
        ops.push({ tabela: 'clientes_cobranca', dados: { cliente_id: clienteId, modelo: 'mensal', desde: inicio } });
        novos.contratos++;
      }
      return contratos.get(clienteId);
    };

    const novoTrabalho = (clienteId, projetoId, titulo, l, extra) => {
      const id = tmp('trabalho');
      ops.push({
        tabela: 'trabalhos', tmp: id,
        dados: Object.assign({
          cliente_id: clienteId, projeto_id: projetoId || null, titulo: titulo || 'Sem título',
          etapa: 'pago', entregue_em: l.data,
          notas_tecnicas: 'Importado da planilha: a data de entrega é a do pagamento (aproximada).',
          _categoria_nome: l.categoriaNome || null,
        }, extra),
      });
      novos.trabalhos++;
      return id;
    };

    linhas.filter((l) => l.escopo && l.incluir).forEach((l) => {
      if (jaTem.has(l.chave)) { jaImportadas++; return; }
      const clienteId = garantirCliente(l.clienteNome);
      // Trabalho e recebível precisam de cliente: sem ele a linha não entra
      if (!clienteId) { semCliente++; return; }
      const recibo = {
        cliente_id: clienteId, valor: l.valor, vencimento: l.data, status: 'pago', pago_em: l.data,
        forma: 'importado', chave_importacao: l.chave, descricao: l.bruto.nome,
      };

      if (l.padrao === 'mensal') {
        recibo.contrato_id = garantirContrato(clienteId, l);
        recibo.descricao = 'Mensalidade ' + D.fmtMes(D.mesDe(l.data));
      } else if (l.padrao === 'lote') {
        // Um lote é um projeto com N vídeos; o pagamento é do projeto
        const nome = (l.descricao ? l.descricao + ' · ' : '') + 'lote de ' + l.lote + ' vídeos (' + D.fmtData(l.data) + ')';
        const pid = garantirProjeto(clienteId, nome);
        // O valor de cada vídeo é a parte dele no lote (divisão igual, em centavos)
        const partes = D.dividirIgual(l.valor, l.lote);
        for (let i = 1; i <= l.lote; i++) novoTrabalho(clienteId, pid, 'Vídeo ' + i, l, { valor: partes[i - 1] });
        recibo.projeto_id = pid;
      } else if (l.padrao === 'dia' || (l.padrao === 'real_time' && l.projetoNome && !l.videoTitulo)) {
        const pid = l.projetoNome ? garantirProjeto(clienteId, l.projetoNome) : null;
        if (l.padrao === 'dia') recibo.trabalho_id = novoTrabalho(clienteId, pid, l.videoTitulo || l.descricao, l, { valor: l.valor });
        else recibo.projeto_id = pid;
      } else if (l.projetoNome) {
        // Texto que é o nome de um projeto: pagamento do projeto inteiro
        recibo.projeto_id = garantirProjeto(clienteId, l.projetoNome);
      } else {
        recibo.trabalho_id = novoTrabalho(clienteId, null, l.videoTitulo || l.descricao, l, { valor: l.valor });
      }

      ops.push({ tabela: 'recebiveis', dados: recibo });
      novos.recebiveis++;
      somaCent += D.centavos(l.valor);
    });

    novos.soma = D.deCentavos(somaCent);
    return { ops, jaImportadas, semCliente, novos };
  }

  // ─── 5. Executar ───────────────────────────────────────────────
  // `criar(tabela, dados)` devolve a linha criada (com id). Troca os
  // 'tmp:' pelos ids reais e resolve `_categoria_nome` pela lista de
  // categorias existente (`categoriasPorNome`: { 'nome sem acento': id }).
  async function executarPlano(criar, ops, categoriasPorNome) {
    const ids = new Map();
    const resolver = (v) => (typeof v === 'string' && v.startsWith('tmp:') ? ids.get(v) : v);
    const cats = categoriasPorNome || {};
    let criados = 0;
    for (const op of ops) {
      const dados = {};
      for (const [k, v] of Object.entries(op.dados)) {
        if (k === '_categoria_nome') {
          const id = v ? cats[semAcento(v)] : null;
          if (id) dados.categoria_id = id;
        } else {
          dados[k] = resolver(v);
        }
      }
      const linha = await criar(op.tabela, dados);
      if (op.tmp) ids.set(op.tmp, linha.id);
      criados++;
    }
    return { criados };
  }

  return { lerTabela, classificar, resumo, montarPlano, executarPlano, acharCliente, lerPadrao, sugerirCategoria };
});
