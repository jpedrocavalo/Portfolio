/* ════════════════════════════════════════════════════════════════
   CRM: DADOS DE DEMONSTRAÇÃO
   --------------------------------------------------------------
   Tudo aqui é FICTÍCIO: nomes, vídeos e valores inventados só para o
   CRM ter o que mostrar enquanto o banco de verdade não está ligado.
   As datas são relativas a "hoje", então a demonstração nunca fica velha.
   ════════════════════════════════════════════════════════════════ */
(function (raiz) {
  const D = raiz.CRM.dominio;

  // Gerador pseudoaleatório fixo: a demonstração é sempre a mesma
  function semente(n) {
    return function () {
      n |= 0; n = (n + 0x6D2B79F5) | 0;
      let t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gerar(hoje) {
    const rnd = semente(20261030);
    const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
    const agora = new Date().toISOString();
    let seq = 0;
    const id = (p) => 'demo-' + p + '-' + (++seq);
    const base = (p, o) => Object.assign({ id: id(p), criado_em: agora, atualizado_em: agora }, o);

    const db = {
      clientes: [], clientes_cobranca: [], contratos_mensais: [], categorias_video: [], servicos: [],
      projetos: [], trabalhos: [], recebiveis: [], despesas: [], leads: [], orcamentos: [],
      tarefas: [], interacoes: [], modelos_mensagem: [], metas: [], config: [], auditoria: [],
    };

    // ─── Catálogo ──────────────────────────────────────────────
    ['Casamento', 'Aftermovie', 'Making of', 'Real Time', 'Formatura', 'Pre wedding', 'Institucional',
      'Imobiliário', 'Podcast', 'Corte e Reels', 'Evento', 'Clipe'].forEach((nome, i) => {
      db.categorias_video.push(base('cat', { nome, ordem: i + 1, ativo: true }));
    });
    const cat = (nome) => db.categorias_video.find((c) => c.nome === nome).id;

    const sv = (nome, linha, unidade, preco, prazo) => {
      const s = base('srv', { nome, linha, unidade, preco, preco_minimo: null, prazo_dias: prazo, descricao: null, ativo: true });
      db.servicos.push(s); return s.id;
    };
    const sEdicao = sv('Edição de vídeo', 'edicao', 'video', 450, 7);
    const sAfter = sv('Aftermovie', 'edicao', 'video', 900, 10);
    const sReels = sv('Reels e cortes', 'edicao', 'video', 120, 3);
    const sColor = sv('Color grading', 'color', 'video', 250, 4);
    sv('Site institucional', 'sites', 'projeto', 2400, 21);

    // ─── Clientes ──────────────────────────────────────────────
    const cl = (nome, tipo, status, extra) => {
      const c = base('cli', Object.assign({ nome, tipo, contato: null, whatsapp: null, email: null, instagram: null, cidade: 'Natal', origem: null, indicado_por: null, status, notas: null }, extra));
      db.clientes.push(c); return c.id;
    };
    const cAurora = cl('Estúdio Aurora', 'produtora', 'recorrente', { contato: 'Helena', origem: 'indicação' });
    const cLume = cl('Casa Lume Eventos', 'produtora', 'ativo', { contato: 'Rafael', origem: 'Instagram' });
    const cMarina = cl('Marina Teixeira', 'pessoa', 'ativo', { origem: 'indicação' });
    const cHorizonte = cl('Cia Horizonte', 'produtora', 'recorrente', { contato: 'Beatriz', origem: 'Instagram' });
    const cPedro = cl('Pedro Valença', 'pessoa', 'ativo', {});
    const cOficina = cl('Oficina do Som', 'pessoa', 'inativo', { notas: 'Parou de pedir em março.' });

    const desdeMensal = D.addMeses(hoje.slice(0, 8) + '01', -8);
    db.clientes_cobranca.push(
      base('cob', { cliente_id: cAurora, modelo: 'avulso', desde: D.addMeses(desdeMensal, -6) }),
      base('cob', { cliente_id: cAurora, modelo: 'mensal', desde: desdeMensal }),
      base('cob', { cliente_id: cHorizonte, modelo: 'mensal', desde: D.addMeses(hoje.slice(0, 8) + '01', -5) }),
      base('cob', { cliente_id: cLume, modelo: 'avulso', desde: D.addMeses(hoje, -14) }),
    );
    const ctAurora = base('ctr', { cliente_id: cAurora, valor_mensal: 2200, dia_vencimento: 5, inicio: desdeMensal, fim: null, videos_inclusos: 6, ativo: true });
    const ctHorizonte = base('ctr', { cliente_id: cHorizonte, valor_mensal: 1500, dia_vencimento: 10, inicio: D.addMeses(hoje.slice(0, 8) + '01', -5), fim: null, videos_inclusos: 4, ativo: true });
    db.contratos_mensais.push(ctAurora, ctHorizonte);

    // ─── Projetos ──────────────────────────────────────────────
    const pj = (cliente, nome, inicio, fim) => {
      const p = base('prj', { cliente_id: cliente, nome, ano: +inicio.slice(0, 4), inicio, fim, notas: null });
      db.projetos.push(p); return p.id;
    };
    const pFest = pj(cLume, 'Festival de Verão', D.addMeses(hoje, -7), D.addMeses(hoje, -6));
    const pFormatura = pj(cLume, 'Formatura Turma Delta', D.addMeses(hoje, -3), D.addMeses(hoje, -2));
    const pSerie = pj(cHorizonte, 'Série Bastidores', D.addMeses(hoje, -5), null);
    const pCampanha = pj(cMarina, 'Campanha de lançamento', D.addMeses(hoje, -9), D.addMeses(hoje, -8));

    // ─── Trabalhos ─────────────────────────────────────────────
    const trabalhos = db.trabalhos;
    const novoTrabalho = (cliente, projeto, titulo, categoria, servico, entregue, valor, extra) => {
      const t = base('trb', Object.assign({
        cliente_id: cliente, projeto_id: projeto, servico_id: servico, categoria_id: cat(categoria), titulo,
        etapa: entregue ? 'pago' : 'edicao',
        recebido_em: entregue ? D.addDias(entregue, -8) : D.addDias(hoje, -3),
        prazo: entregue || D.addDias(hoje, 4), entregue_em: entregue || null,
        rodadas: Math.floor(rnd() * 3), valor, horas: Math.round((3 + rnd() * 9) * 2) / 2,
        links: {}, notas_tecnicas: null, entra_no_portfolio: false,
      }, extra));
      trabalhos.push(t); return t;
    };

    // Entregues e pagos, espalhados nos últimos 14 meses
    const avulsos = [
      [cMarina, null, 'Pre wedding Marina e Caio', 'Pre wedding', sEdicao, -13, 650],
      [cMarina, pCampanha, 'Teaser da campanha', 'Institucional', sEdicao, -9, 700],
      [cMarina, pCampanha, 'Vídeo principal da campanha', 'Institucional', sEdicao, -9, 700],
      [cPedro, null, 'Casamento Pedro e Ana', 'Casamento', sEdicao, -12, 1800],
      [cPedro, null, 'Reels do casamento', 'Corte e Reels', sReels, -11, 150],
      [cOficina, null, 'Clipe Oficina, faixa 1', 'Clipe', sEdicao, -13, 600],
      [cOficina, null, 'Clipe Oficina, faixa 2', 'Clipe', sEdicao, -10, 600],
      [cLume, pFest, 'Festival, dia 1', 'Aftermovie', sAfter, -7, 0],
      [cLume, pFest, 'Festival, dia 2', 'Aftermovie', sAfter, -7, 0],
      [cLume, pFest, 'Festival, dia 3', 'Aftermovie', sAfter, -7, 0],
      [cLume, pFormatura, 'Formatura, making of', 'Making of', sEdicao, -3, 0],
      [cLume, pFormatura, 'Formatura, aftermovie', 'Formatura', sAfter, -3, 0],
      [cLume, null, 'Lançamento do imóvel Vista Mar', 'Imobiliário', sEdicao, -5, 800],
      [cLume, null, 'Podcast episódio 12', 'Podcast', sEdicao, -2, 380],
      [cLume, null, 'Podcast episódio 13', 'Podcast', sEdicao, -1, 380],
    ];
    avulsos.forEach(([c, p, t, ca, s, m, v]) => {
      const dia = Math.min(+hoje.slice(8, 10), 27);
      const data = D.addMeses(hoje.slice(0, 8) + String(dia).padStart(2, '0'), m);
      const entregue = data > hoje ? D.addDias(hoje, -1) : data;
      novoTrabalho(c, p, t, ca, s, entregue, v === 0 ? null : v);
    });

    // Mensalistas: vídeos entregues em cada mês (mensalidade é rateada)
    const titulosAurora = ['Corte do podcast', 'Reels da semana', 'Institucional curto', 'Depoimento do cliente', 'Bastidores', 'Teaser do evento'];
    for (let m = -8; m <= 0; m++) {
      const qtd = 2 + Math.floor(rnd() * 3);
      for (let i = 0; i < qtd; i++) {
        const dia = 3 + Math.floor(rnd() * 22);
        let data = D.addMeses(hoje.slice(0, 8) + '01', m).slice(0, 8) + String(dia).padStart(2, '0');
        if (data > hoje) data = D.addDias(hoje, -1);
        novoTrabalho(cAurora, null, pick(titulosAurora) + ' ' + (i + 1), pick(['Corte e Reels', 'Institucional', 'Evento']), pick([sReels, sEdicao]), data, null);
      }
    }
    for (let m = -5; m <= 0; m++) {
      const qtd = 1 + Math.floor(rnd() * 3);
      for (let i = 0; i < qtd; i++) {
        const dia = 4 + Math.floor(rnd() * 21);
        let data = D.addMeses(hoje.slice(0, 8) + '01', m).slice(0, 8) + String(dia).padStart(2, '0');
        if (data > hoje) data = D.addDias(hoje, -2);
        novoTrabalho(cHorizonte, pSerie, 'Bastidores, ep. ' + (trabalhos.filter((t) => t.projeto_id === pSerie).length + 1), 'Real Time', sEdicao, data, null);
      }
    }

    // Em andamento hoje
    novoTrabalho(cHorizonte, pSerie, 'Bastidores, próximo episódio', 'Real Time', sEdicao, null, null, { etapa: 'edicao', prazo: D.addDias(hoje, 2) });
    novoTrabalho(cMarina, null, 'Vídeo de 15 anos da Clara', 'Evento', sEdicao, null, 900, { etapa: 'revisao', prazo: D.addDias(hoje, -2), rodadas: 1 });
    novoTrabalho(cPedro, null, 'Corporativo, versão curta', 'Institucional', sEdicao, null, 650, { etapa: 'recebido', prazo: D.addDias(hoje, 9) });
    novoTrabalho(cAurora, null, 'Corte do podcast 99', 'Corte e Reels', sReels, null, null, { etapa: 'color', prazo: D.addDias(hoje, 1) });
    novoTrabalho(cLume, null, 'Aftermovie do congresso', 'Aftermovie', sAfter, null, 1100, { etapa: 'aprovado', prazo: D.addDias(hoje, 3), rodadas: 2 });
    // Entregue e ainda não pago
    novoTrabalho(cLume, null, 'Podcast episódio 14', 'Podcast', sEdicao, D.addDias(hoje, -6), 380, { etapa: 'entregue' });

    // ─── Recebíveis ────────────────────────────────────────────
    const rec = (o) => db.recebiveis.push(base('rec', Object.assign({
      cliente_id: null, projeto_id: null, trabalho_id: null, contrato_id: null, descricao: null,
      status: 'pago', pago_em: null, forma: 'pix', parcela: null, parcelas: null, chave_importacao: null,
    }, o)));

    // Cada vídeo avulso entregue com valor vira um pagamento
    trabalhos.filter((t) => t.valor && t.entregue_em && t.etapa === 'pago').forEach((t) => {
      const pago = D.addDias(t.entregue_em, 2);
      rec({ cliente_id: t.cliente_id, trabalho_id: t.id, descricao: t.titulo, valor: t.valor, vencimento: t.entregue_em, pago_em: pago > hoje ? hoje : pago });
    });
    // O trabalho entregue e não pago: pagamento aberto, ainda no prazo
    const naoPago = trabalhos.find((t) => t.etapa === 'entregue');
    rec({ cliente_id: naoPago.cliente_id, trabalho_id: naoPago.id, descricao: naoPago.titulo, valor: naoPago.valor, vencimento: D.addDias(hoje, 6), status: 'a_receber', forma: null });
    // Projetos pagos de uma vez
    rec({ cliente_id: cLume, projeto_id: pFest, descricao: 'Festival de Verão (3 vídeos)', valor: 2700, vencimento: D.addMeses(hoje, -7), pago_em: D.addMeses(hoje, -7) });
    rec({ cliente_id: cLume, projeto_id: pFormatura, descricao: 'Formatura Turma Delta (2 vídeos)', valor: 1500, vencimento: D.addMeses(hoje, -3), pago_em: D.addDias(D.addMeses(hoje, -3), 3) });
    // Um aberto e atrasado
    rec({ cliente_id: cMarina, trabalho_id: trabalhos.find((t) => t.titulo === 'Vídeo de 15 anos da Clara').id, descricao: 'Entrada, vídeo de 15 anos', valor: 450, vencimento: D.addDias(hoje, -5), status: 'a_receber', forma: null, parcela: 1, parcelas: 2 });
    rec({ cliente_id: cMarina, trabalho_id: trabalhos.find((t) => t.titulo === 'Vídeo de 15 anos da Clara').id, descricao: 'Saldo, vídeo de 15 anos', valor: 450, vencimento: D.addDias(hoje, 12), status: 'a_receber', forma: null, parcela: 2, parcelas: 2 });

    // Mensalidades: as passadas pagas, a do mês corrente em aberto
    [ctAurora, ctHorizonte].forEach((c) => {
      D.gerarMensalidades(c, db.recebiveis, D.addMeses(hoje, 1)).forEach((m, i) => {
        const passou = m.vencimento < hoje;
        const atrasada = passou && m.vencimento >= D.addDias(hoje, -6) && c === ctHorizonte;
        rec(Object.assign({}, m, { id: id('rec'), criado_em: agora, atualizado_em: agora, projeto_id: null, trabalho_id: null, forma: passou && !atrasada ? 'pix' : null,
          status: passou && !atrasada ? 'pago' : 'a_receber', pago_em: passou && !atrasada ? D.addDias(m.vencimento, i % 3).replace(/^(.*)$/, (d) => (d > hoje ? hoje : d)) : null,
          parcela: null, parcelas: null, chave_importacao: null }));
      });
    });
    // Contratos têm seus recebíveis ligados pelo gerador, mas sem o resto dos campos
    db.recebiveis.forEach((r) => {
      for (const k of ['projeto_id', 'trabalho_id', 'descricao', 'forma', 'parcela', 'parcelas', 'chave_importacao', 'pago_em']) if (r[k] === undefined) r[k] = null;
    });

    // ─── Despesas ──────────────────────────────────────────────
    for (let m = -9; m <= 0; m++) {
      const mes = D.addMeses(hoje.slice(0, 8) + '01', m);
      db.despesas.push(base('dsp', { descricao: 'Assinatura de software de edição', valor: 129, data: mes.slice(0, 8) + '05', categoria: 'software', recorrente: true }));
      db.despesas.push(base('dsp', { descricao: 'Armazenamento na nuvem', valor: 59.9, data: mes.slice(0, 8) + '12', categoria: 'armazenamento', recorrente: true }));
    }
    db.despesas.push(base('dsp', { descricao: 'HD externo 4 TB', valor: 780, data: D.addMeses(hoje, -4), categoria: 'equipamento', recorrente: false }));

    // ─── Vendas ────────────────────────────────────────────────
    db.leads.push(
      base('led', { nome: 'Clínica Bem Viver', cliente_id: null, servico_id: sEdicao, valor_estimado: 1800, etapa: 'orcamento', motivo_perda: null, proxima_acao: 'Cobrar resposta do orçamento', proxima_acao_em: D.addDias(hoje, 2), origem: 'Instagram', data_evento: null }),
      base('led', { nome: 'Casamento Julia e Marcos', cliente_id: null, servico_id: sEdicao, valor_estimado: 2200, etapa: 'conversa', motivo_perda: null, proxima_acao: 'Enviar portfólio de casamentos', proxima_acao_em: D.addDias(hoje, 1), origem: 'indicação', data_evento: D.addMeses(hoje, 3) }),
      base('led', { nome: 'Rede de academias', cliente_id: null, servico_id: sReels, valor_estimado: 1500, etapa: 'negociacao', motivo_perda: null, proxima_acao: 'Responder sobre pacote mensal', proxima_acao_em: D.addDias(hoje, 4), origem: 'Instagram', data_evento: null }),
    );

    // ─── Tarefas, notas, modelos, metas e config ──────────────
    db.tarefas.push(
      base('tar', { titulo: 'Cobrar o saldo da Marina', para: D.addDias(hoje, -1), feita: false, cliente_id: cMarina, lead_id: null, trabalho_id: null }),
      base('tar', { titulo: 'Exportar e subir o corte do podcast 99', para: hoje, feita: false, cliente_id: cAurora, lead_id: null, trabalho_id: null }),
      base('tar', { titulo: 'Mandar o portfólio de casamento para a Julia', para: D.addDias(hoje, 1), feita: false, cliente_id: null, lead_id: db.leads[1].id, trabalho_id: null }),
      base('tar', { titulo: 'Renovar o armazenamento da nuvem', para: D.addDias(hoje, 8), feita: false, cliente_id: null, lead_id: null, trabalho_id: null }),
      base('tar', { titulo: 'Arquivar os brutos do festival', para: D.addDias(hoje, -4), feita: true, cliente_id: cLume, lead_id: null, trabalho_id: null }),
    );
    db.interacoes.push(
      base('int', { cliente_id: cMarina, tipo: 'whatsapp', texto: 'Pediu mais uma rodada de cor no vídeo de 15 anos.', em: new Date(Date.now() - 2 * 86400000).toISOString() }),
      base('int', { cliente_id: cAurora, tipo: 'reuniao', texto: 'Alinhou o pacote de 6 vídeos por mês até o fim do ano.', em: new Date(Date.now() - 20 * 86400000).toISOString() }),
      base('int', { cliente_id: cLume, tipo: 'nota', texto: 'Prefere receber a prévia pelo link, não pelo Drive.', em: new Date(Date.now() - 9 * 86400000).toISOString() }),
    );
    db.modelos_mensagem.push(
      base('mod', { nome: 'Cobrança gentil', texto: 'Oi {cliente}, tudo bem? Passando para lembrar do pagamento de {valor}, com vencimento em {prazo}. Qualquer dúvida é só chamar.' }),
      base('mod', { nome: 'Vídeo pronto para revisão', texto: 'Oi {cliente}! A primeira versão está pronta para você ver. Me conta o que ajustar até {prazo}.' }),
    );
    db.metas.push(
      base('met', { periodo: hoje.slice(0, 4), tipo: 'receita', valor: 60000 }),
      base('met', { periodo: hoje.slice(0, 7), tipo: 'receita', valor: 5500 }),
    );
    db.config.push(
      base('cfg', { chave: 'mei_limite', valor: 81000 }),
      base('cfg', { chave: 'estudio', valor: { nome: 'Estúdio de demonstração', whatsapp: '', instagram: '', site: '' } }),
    );
    return db;
  }

  raiz.CRM.demonstracao = { gerar };
})(window);
