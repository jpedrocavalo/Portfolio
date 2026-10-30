/* ════════════════════════════════════════════════════════════════
   CRM: LÓGICA DE NEGÓCIO (pura, sem tela)
   --------------------------------------------------------------
   Datas, dinheiro, mensalidades e a atribuição da receita. Roda no
   navegador (window.CRM.dominio) e no Node (para os testes), por isso
   não toca em DOM nem em React.

   Datas são sempre texto ISO 'AAAA-MM-DD', nunca objeto Date: assim
   o fuso horário não desloca um dia por engano.
   ════════════════════════════════════════════════════════════════ */
(function (raiz, fabrica) {
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  raiz.CRM = raiz.CRM || {};
  raiz.CRM.dominio = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {

  // ─── Etapas de um trabalho ─────────────────────────────────────
  const ETAPAS = [
    { id: 'recebido', nome: 'Material recebido' },
    { id: 'edicao',   nome: 'Edição' },
    { id: 'revisao',  nome: 'Revisão' },
    { id: 'color',    nome: 'Color' },
    { id: 'aprovado', nome: 'Aprovado' },
    { id: 'entregue', nome: 'Entregue' },
    { id: 'pago',     nome: 'Pago' },
  ];

  // ─── Texto ─────────────────────────────────────────────────────
  // Minúsculo e sem acento, para comparar nomes
  function semAcento(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/\s+/g, ' ').trim();
  }

  // ─── Datas ISO ─────────────────────────────────────────────────
  const pad2 = (n) => String(n).padStart(2, '0');
  const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

  function ultimoDiaDoMes(ano, mes) { return new Date(Date.UTC(ano, mes, 0)).getUTCDate(); }

  function isoValido(s) {
    const m = ISO.exec(String(s || ''));
    if (!m) return false;
    const [a, mes, d] = [+m[1], +m[2], +m[3]];
    return mes >= 1 && mes <= 12 && d >= 1 && d <= ultimoDiaDoMes(a, mes);
  }

  function hojeISO(agora) {
    const d = agora || new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }

  const mesDe = (iso) => String(iso).slice(0, 7);
  const anoDe = (iso) => +String(iso).slice(0, 4);

  function addDias(iso, n) {
    const [a, m, d] = iso.split('-').map(Number);
    const t = new Date(Date.UTC(a, m - 1, d + n));
    return t.getUTCFullYear() + '-' + pad2(t.getUTCMonth() + 1) + '-' + pad2(t.getUTCDate());
  }

  // Soma meses mantendo o dia, ou o último dia do mês se o dia não existir
  function addMeses(iso, n) {
    const [a, m, d] = iso.split('-').map(Number);
    const idx = a * 12 + (m - 1) + n;
    const ano = Math.floor(idx / 12), mes = (idx % 12) + 1;
    return ano + '-' + pad2(mes) + '-' + pad2(Math.min(d, ultimoDiaDoMes(ano, mes)));
  }

  function diffDias(de, ate) {
    const t = (s) => { const [a, m, d] = s.split('-').map(Number); return Date.UTC(a, m - 1, d); };
    return Math.round((t(ate) - t(de)) / 86400000);
  }

  // 'dd/mm/aaaa' -> ISO, ou null se for inválida
  function parseDataBR(s) {
    const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s || '').trim());
    if (!m) return null;
    const iso = m[3] + '-' + pad2(m[2]) + '-' + pad2(m[1]);
    return isoValido(iso) ? iso : null;
  }

  function fmtData(iso) {
    if (!isoValido(iso)) return '';
    return iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4);
  }

  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  // '2026-10' -> 'out/2026'
  function fmtMes(chave) {
    const m = /^(\d{4})-(\d{2})/.exec(chave || '');
    return m ? MESES[+m[2] - 1] + '/' + m[1] : '';
  }

  // ─── Dinheiro ──────────────────────────────────────────────────
  // Trabalhamos em número com 2 casas; arredondar a centavos evita 0,1+0,2.
  const centavos = (n) => Math.round((+n || 0) * 100);
  const deCentavos = (c) => c / 100;

  function fmtBRL(n) {
    const v = deCentavos(centavos(n));
    const t = Math.abs(v).toFixed(2);
    const [int, dec] = t.split('.');
    const milhar = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (v < 0 ? '-' : '') + 'R$ ' + milhar + ',' + dec;
  }

  // 'R$ 1.234,56' -> 1234.56 ; NaN se não for número
  function parseBRL(s) {
    let t = String(s == null ? '' : s).replace(/R\$/gi, '').replace(/\s/g, '');
    if (!t) return NaN;
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    else if (!/^-?\d+\.\d{1,2}$/.test(t)) t = t.replace(/\./g, '');
    const n = Number(t);
    return Number.isFinite(n) ? deCentavos(centavos(n)) : NaN;
  }

  // Divide `valor` em n partes iguais em centavos; o resto vai uma
  // moeda por vez para as primeiras partes. A soma é sempre exata.
  function dividirIgual(valor, n) {
    if (n <= 0) return [];
    const total = centavos(valor);
    const base = Math.floor(total / n), resto = total - base * n;
    return Array.from({ length: n }, (_, i) => deCentavos(base + (i < resto ? 1 : 0)));
  }

  // ─── Recebíveis ────────────────────────────────────────────────
  // pago | atrasado | a_receber | cancelado
  function statusEfetivo(rec, hoje) {
    if (rec.status === 'pago') return 'pago';
    if (rec.status === 'cancelado') return 'cancelado';
    return rec.vencimento < hoje ? 'atrasado' : 'a_receber';
  }

  // Gera as mensalidades que faltam de um contrato, do mês de início até
  // `ate` (ISO) ou o fim do contrato, o que vier primeiro. Não duplica:
  // `existentes` são os recebíveis já criados (só vale o mesmo contrato+mês).
  function gerarMensalidades(contrato, existentes, ate) {
    if (!contrato || contrato.ativo === false) return [];
    const ja = new Set((existentes || [])
      .filter((r) => r.contrato_id === contrato.id)
      .map((r) => mesDe(r.vencimento)));
    const limite = contrato.fim && contrato.fim < ate ? contrato.fim : ate;
    const dia = Math.min(Math.max(+contrato.dia_vencimento || 1, 1), 28);
    const novos = [];
    let cursor = mesDe(contrato.inicio) + '-01';
    while (cursor <= limite) {
      const mes = mesDe(cursor);
      const venc = mes + '-' + pad2(dia);
      // Só conta a parcela se o vencimento cai dentro do contrato
      if (venc >= contrato.inicio && venc <= limite && !ja.has(mes)) {
        novos.push({
          cliente_id: contrato.cliente_id,
          contrato_id: contrato.id,
          descricao: 'Mensalidade ' + fmtMes(mes),
          valor: contrato.valor_mensal,
          vencimento: venc,
          status: 'a_receber',
        });
      }
      cursor = addMeses(cursor, 1);
    }
    return novos;
  }

  // Modelo de cobrança vigente de um cliente em `hoje`: a linha mais
  // recente com `desde` <= hoje. Sem nenhuma, vale 'avulso' (por vídeo).
  function modeloDeCobranca(cobrancas, clienteId, hoje) {
    const vigentes = (cobrancas || [])
      .filter((c) => c.cliente_id === clienteId && c.desde <= hoje)
      .sort((a, b) => b.desde.localeCompare(a.desde));
    return vigentes.length ? vigentes[0].modelo : 'avulso';
  }

  // ─── Atribuição da receita (base de TODOS os gráficos) ─────────
  // Cada recebível vira "fatias", e cada fatia carrega as dimensões em
  // que pode ser agrupada: cliente, projeto, trabalho, serviço, categoria.
  //
  //  • ligado a um TRABALHO: uma fatia, com as dimensões dele;
  //  • ligado a um PROJETO: dividido igualmente entre os vídeos do projeto;
  //  • de MENSALIDADE: dividido igualmente entre os vídeos que o cliente
  //    teve ENTREGUES naquele mês. Mês sem entrega vira uma fatia
  //    'mensal_sem_entrega', que entra em cliente, mês e ano mas em
  //    nenhuma categoria, serviço ou projeto;
  //  • ligado só a um cliente: uma fatia sem vídeo.
  //
  // A SOMA das fatias de um recebível é sempre o valor dele.
  function atribuirReceita(t) {
    const trabalhos = t.trabalhos || [];
    const porId = new Map(trabalhos.map((x) => [x.id, x]));
    const doProjeto = new Map();
    trabalhos.forEach((x) => {
      if (!x.projeto_id) return;
      if (!doProjeto.has(x.projeto_id)) doProjeto.set(x.projeto_id, []);
      doProjeto.get(x.projeto_id).push(x);
    });
    const projetoPorId = new Map((t.projetos || []).map((p) => [p.id, p]));
    const contratoPorId = new Map((t.contratos_mensais || []).map((c) => [c.id, c]));

    const fatias = [];
    const dimsDoTrabalho = (x) => ({
      cliente_id: x.cliente_id, projeto_id: x.projeto_id || null, trabalho_id: x.id,
      servico_id: x.servico_id || null, categoria_id: x.categoria_id || null,
    });

    (t.recebiveis || []).forEach((r) => {
      if (r.status === 'cancelado') return;
      const realizado = r.status === 'pago';
      const data = realizado ? r.pago_em : r.vencimento;
      const base = { recebivel_id: r.id, data, realizado };
      const empurrar = (valor, dims, tipo) => fatias.push({ ...base, valor, tipo, ...dims });
      const vazio = { cliente_id: r.cliente_id || null, projeto_id: null, trabalho_id: null, servico_id: null, categoria_id: null };

      if (r.trabalho_id && porId.has(r.trabalho_id)) {
        empurrar(+r.valor, dimsDoTrabalho(porId.get(r.trabalho_id)), 'avulso');
      } else if (r.projeto_id) {
        const videos = doProjeto.get(r.projeto_id) || [];
        const projeto = projetoPorId.get(r.projeto_id);
        if (videos.length) {
          dividirIgual(r.valor, videos.length).forEach((v, i) => empurrar(v, dimsDoTrabalho(videos[i]), 'projeto'));
        } else {
          empurrar(+r.valor, { ...vazio, cliente_id: r.cliente_id || (projeto && projeto.cliente_id) || null, projeto_id: r.projeto_id }, 'projeto_sem_video');
        }
      } else if (r.contrato_id) {
        const contrato = contratoPorId.get(r.contrato_id);
        const cliente = r.cliente_id || (contrato && contrato.cliente_id) || null;
        const mes = mesDe(r.vencimento);
        const videos = trabalhos.filter((x) => x.cliente_id === cliente && x.entregue_em && mesDe(x.entregue_em) === mes);
        if (videos.length) {
          dividirIgual(r.valor, videos.length).forEach((v, i) => empurrar(v, dimsDoTrabalho(videos[i]), 'mensal'));
        } else {
          empurrar(+r.valor, { ...vazio, cliente_id: cliente }, 'mensal_sem_entrega');
        }
      } else {
        empurrar(+r.valor, vazio, 'avulso_sem_video');
      }
    });
    return fatias;
  }

  // ─── Resumos ───────────────────────────────────────────────────
  const somar = (arr, f) => deCentavos(arr.reduce((s, x) => s + centavos(f(x)), 0));

  // Números do painel para um mês ('AAAA-MM')
  function resumoDoMes(t, mes, hoje) {
    const recs = (t.recebiveis || []).filter((r) => r.status !== 'cancelado');
    const pagosNoMes = recs.filter((r) => r.status === 'pago' && r.pago_em && mesDe(r.pago_em) === mes);
    const abertos = recs.filter((r) => r.status !== 'pago');
    const em30 = addDias(hoje, 30);
    return {
      recebido: somar(pagosNoMes, (r) => r.valor),
      qtdRecebidos: pagosNoMes.length,
      previstoNoMes: somar(abertos.filter((r) => mesDe(r.vencimento) === mes), (r) => r.valor),
      atrasado: somar(abertos.filter((r) => r.vencimento < hoje), (r) => r.valor),
      qtdAtrasados: abertos.filter((r) => r.vencimento < hoje).length,
      aReceber30d: somar(abertos.filter((r) => r.vencimento >= hoje && r.vencimento <= em30), (r) => r.valor),
      entregues: (t.trabalhos || []).filter((x) => x.entregue_em && mesDe(x.entregue_em) === mes).length,
      emAndamento: (t.trabalhos || []).filter((x) => !['entregue', 'pago'].includes(x.etapa)).length,
    };
  }

  // Quanto já entrou no ano e quanto isso é do limite (ex.: do MEI)
  function acumuladoDoAno(t, ano, limite) {
    const pagos = (t.recebiveis || []).filter((r) => r.status === 'pago' && r.pago_em && anoDe(r.pago_em) === ano);
    const total = somar(pagos, (r) => r.valor);
    return { total, limite: limite || null, pct: limite ? total / limite : null };
  }

  return {
    ETAPAS, semAcento,
    isoValido, hojeISO, mesDe, anoDe, addDias, addMeses, diffDias, ultimoDiaDoMes,
    parseDataBR, fmtData, fmtMes,
    centavos, deCentavos, fmtBRL, parseBRL, dividirIgual,
    statusEfetivo, gerarMensalidades, modeloDeCobranca, atribuirReceita, somar,
    resumoDoMes, acumuladoDoAno,
  };
});
