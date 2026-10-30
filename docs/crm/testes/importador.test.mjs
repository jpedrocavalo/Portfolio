// Testes do importador da planilha. Rode com:
//   node --test "docs/crm/testes/*.test.mjs"
// Só dados FICTÍCIOS, no mesmo formato da planilha real. Os totais abaixo
// foram somados à mão a partir de fixtures/entradas-ficticias.tsv.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const D = require('../../../project/crm/dominio.js');
const I = require('../../../project/crm/importador.js');

const TSV = readFileSync(new URL('./fixtures/entradas-ficticias.tsv', import.meta.url), 'utf8');

const OPCOES = {
  clientes: [{ nome: 'Produtora Exemplo' }, { nome: 'Estúdio Modelo' }, { nome: 'Casal Exemplo' }],
  categoriasVideo: ['Casamento', 'Formatura', 'Imobiliário', 'Podcast', 'Corte e Reels', 'Real Time', 'Evento'],
  projetosConhecidos: [],
};

const classificadas = () => I.classificar(I.lerTabela(TSV), OPCOES);
const porTexto = (ls, trecho) => ls.find((l) => l.bruto.nome.includes(trecho));

// ─── Ler ─────────────────────────────────────────────────────────
test('lerTabela lê o TSV colado do Sheets, com cabeçalho', () => {
  const t = I.lerTabela(TSV);
  assert.equal(t.aviso, null);
  assert.equal(t.linhas.length, 16);
  assert.deepEqual(t.linhas[0], { n: 1, data: '03/05/2026', nome: 'Casamento Produtora Exemplo', categoria: 'Edição', valor: 'R$ 150,00', mes: '5' });
});

test('lerTabela aceita CSV com aspas e ponto e vírgula, e tabela sem cabeçalho', () => {
  const csv = 'Data;Nome;Categoria;Valor\n03/05/2026;"Casamento ""Alfa"" Produtora Exemplo";Edição;"R$ 1.234,56"\n';
  const t = I.lerTabela(csv);
  assert.equal(t.linhas[0].nome, 'Casamento "Alfa" Produtora Exemplo');
  assert.equal(t.linhas[0].valor, 'R$ 1.234,56');

  const semCab = I.lerTabela('03/05/2026\tCasamento X\tEdição\tR$ 10,00\t5\n');
  assert.equal(semCab.linhas.length, 1);
  assert.equal(semCab.linhas[0].categoria, 'Edição');

  assert.equal(I.lerTabela('').linhas.length, 0);
  assert.match(I.lerTabela('Foo\tBar\n1\t2\n').aviso, /colunas/);
});

// ─── Escopo: só Edição ───────────────────────────────────────────
test('só Categoria = Edição entra; o resto fica registrado com o motivo', () => {
  const ls = classificadas();
  assert.equal(ls.filter((l) => l.escopo).length, 14);
  const site = porTexto(ls, 'Site Alfa');
  assert.equal(site.escopo, false);
  assert.equal(site.motivoIgnorada, 'categoria: Sites');
  assert.equal(porTexto(ls, 'reembolso').motivoIgnorada, 'sem categoria');
});

test('comparação de categoria ignora acento e maiúscula', () => {
  const t = I.lerTabela('Data\tNome\tCategoria\tValor\n01/01/2026\tX Produtora Exemplo\tEDICAO\tR$ 1,00\n');
  assert.equal(I.classificar(t, OPCOES)[0].escopo, true);
});

// ─── Cliente, padrões e categoria ────────────────────────────────
test('cliente é o sufixo do texto, sem acento e sem diferença de maiúscula', () => {
  const ls = classificadas();
  assert.equal(porTexto(ls, 'Casamento Produtora').clienteNome, 'Produtora Exemplo');
  assert.equal(porTexto(ls, 'dia 2 Festival').clienteNome, 'Produtora Exemplo'); // veio em minúsculo
  assert.equal(porTexto(ls, 'mensal').clienteNome, 'Estúdio Modelo');
  assert.equal(porTexto(ls, 'Reels').clienteNome, 'Casal Exemplo');
});

test('padrões do texto: mensal, lote, real time, dia N', () => {
  const ls = classificadas();
  assert.equal(porTexto(ls, 'mensal').padrao, 'mensal');
  const lote = porTexto(ls, '3 videos');
  assert.equal(lote.padrao, 'lote');
  assert.equal(lote.lote, 3);
  const rt = porTexto(ls, 'real time');
  assert.equal(rt.padrao, 'real_time');
  assert.equal(rt.projetoNome, 'PROJETO ALFA');   // caixa alta é mantida
  assert.equal(rt.categoriaNome, 'Real Time');
  const dia = porTexto(ls, 'dia 2');
  assert.equal(dia.padrao, 'dia');
  assert.equal(dia.videoTitulo, 'Dia 2');
  assert.equal(dia.projetoNome, 'Festival Exemplo');
});

test('categoria de vídeo sugerida por palavra-chave, só entre as existentes', () => {
  const ls = classificadas();
  assert.equal(porTexto(ls, 'Casamento Produtora').categoriaNome, 'Casamento');
  assert.equal(porTexto(ls, 'formatura').categoriaNome, 'Formatura');
  assert.equal(porTexto(ls, 'Imobiliário').categoriaNome, 'Imobiliário');
  assert.equal(porTexto(ls, 'Reels').categoriaNome, 'Corte e Reels');
  assert.equal(I.sugerirCategoria('algo sem pista', OPCOES.categoriasVideo), '');
  // sem a categoria na lista, não sugere o que não existe
  assert.equal(I.sugerirCategoria('casamento', ['Podcast']), '');
});

test('texto que já é nome de projeto conhecido vira pagamento do projeto', () => {
  const t = I.lerTabela('Data\tNome\tCategoria\tValor\n01/01/2026\tclick fictício Produtora Exemplo\tEdição\tR$ 600,00\n');
  const l = I.classificar(t, { ...OPCOES, projetosConhecidos: ['Click Fictício'] })[0];
  assert.equal(l.projetoNome, 'Click Fictício');
});

// ─── Dúvidas ─────────────────────────────────────────────────────
test('cliente desconhecido e texto que não parece vídeo viram dúvida e não entram', () => {
  const ls = classificadas();
  const curso = porTexto(ls, 'curso');
  assert.ok(curso.duvidas.includes('o texto não parece edição de vídeo'));
  assert.ok(curso.duvidas.includes('cliente não reconhecido'));
  assert.equal(curso.incluir, false);
  const desc = porTexto(ls, 'Cliente Desconhecido');
  assert.deepEqual(desc.duvidas, ['cliente não reconhecido']);
  assert.equal(desc.incluir, false);
  // o resto entra por padrão
  assert.equal(ls.filter((l) => l.escopo && l.incluir).length, 12);
});

test('entrada só com o nome do cliente é aceita, com aviso', () => {
  const l = porTexto(classificadas(), 'Estúdio Modelo' );
  const so = classificadas().find((x) => x.bruto.nome === 'Estúdio Modelo');
  assert.equal(so.incluir, true);
  assert.ok(so.avisos.includes('entrada sem título'));
  assert.ok(l);
});

// ─── Resumo e totais ─────────────────────────────────────────────
test('resumo: totais calculados à mão', () => {
  const r = I.resumo(classificadas());
  assert.equal(r.total, 16);
  assert.equal(r.incluidas.n, 12);
  assert.equal(r.incluidas.soma, 1715);
  assert.deepEqual(r.incluidas.porMes, { '2026-05': 215, '2026-06': 490, '2026-07': 1010 });
  assert.equal(r.duvidas.n, 2);
  assert.equal(r.duvidas.soma, 560);
  assert.equal(r.ignoradas.n, 2);
  assert.equal(r.ignoradas.soma, 320.5);
  assert.deepEqual(r.ignoradas.porMotivo, {
    'categoria: Sites': { n: 1, soma: 200 },
    'sem categoria': { n: 1, soma: 120.5 },
  });
  // nada some: incluídas + dúvidas + ignoradas = tudo
  assert.equal(D.centavos(r.incluidas.soma + r.duvidas.soma + r.ignoradas.soma), D.centavos(1715 + 560 + 320.5));
});

test('decidir sobre uma dúvida muda os totais (cenário "entra")', () => {
  const ls = classificadas();
  porTexto(ls, 'curso').incluir = true;
  porTexto(ls, 'Cliente Desconhecido').incluir = true;
  const r = I.resumo(ls);
  assert.equal(r.incluidas.n, 14);
  assert.equal(r.incluidas.soma, 2275);
  assert.equal(r.incluidas.porMes['2026-07'], 1570);
});

// ─── Chave de deduplicação ───────────────────────────────────────
test('chave: entradas idênticas no mesmo dia ganham contador, e são estáveis', () => {
  const a = classificadas();
  const b = classificadas();
  const pod = a.filter((l) => l.bruto.nome === 'Podcast Estúdio Modelo' && l.data === '2026-07-14');
  assert.equal(pod.length, 2);
  assert.notEqual(pod[0].chave, pod[1].chave);
  assert.ok(pod[0].chave.endsWith('#1') && pod[1].chave.endsWith('#2'));
  assert.deepEqual(a.map((l) => l.chave), b.map((l) => l.chave));
  // a ordem das linhas na planilha não muda a chave de cada entrada
  const t = I.lerTabela(TSV);
  const invertida = I.classificar({ linhas: [...t.linhas].reverse() }, OPCOES);
  const chaves = (ls) => ls.filter((l) => l.chave).map((l) => l.chave.replace(/#\d+$/, '')).sort();
  assert.deepEqual(chaves(invertida), chaves(a));
});

// ─── Plano de gravação ───────────────────────────────────────────
const contar = (ops, tabela) => ops.filter((o) => o.tabela === tabela).length;

test('montarPlano: o que seria criado, sem gravar nada', () => {
  const plano = I.montarPlano(classificadas(), {}, {});
  assert.equal(plano.jaImportadas, 0);
  assert.equal(plano.semCliente, 0);
  assert.deepEqual(plano.novos, { clientes: 3, projetos: 3, contratos: 1, trabalhos: 12, recebiveis: 12, soma: 1715 });
  assert.equal(contar(plano.ops, 'clientes'), 3);
  assert.equal(contar(plano.ops, 'contratos_mensais'), 1);
  assert.equal(contar(plano.ops, 'clientes_cobranca'), 1);
  // Toda referência 'tmp:' aponta para algo criado ANTES dela. Esse é o
  // invariante que importa (a importação cria linha a linha, então a
  // ordem entre tabelas varia).
  const criados = new Set();
  plano.ops.forEach((op, i) => {
    Object.values(op.dados).forEach((v) => {
      if (typeof v === 'string' && v.startsWith('tmp:')) assert.ok(criados.has(v), `op ${i} (${op.tabela}) usa ${v} antes de criar`);
    });
    if (op.tmp) criados.add(op.tmp);
  });
  // Cliente, projeto e contrato nunca são criados à toa: alguém os usa.
  // (Trabalho pode não ser referenciado: os vídeos de um lote existem,
  // mas o pagamento é do projeto.)
  const usados = new Set(plano.ops.flatMap((o) => Object.values(o.dados)).filter((v) => typeof v === 'string' && v.startsWith('tmp:')));
  const orfaos = [...criados].filter((t) => /^tmp:(cliente|projeto|contrato)_/.test(t) && !usados.has(t));
  assert.deepEqual(orfaos, []);
});

test('montarPlano: cada padrão liga o recebível ao lugar certo', () => {
  const plano = I.montarPlano(classificadas(), {}, {});
  const rec = (trecho) => plano.ops.find((o) => o.tabela === 'recebiveis' && o.dados.descricao.includes(trecho) ||
    o.tabela === 'recebiveis' && trecho === 'mensal' && o.dados.descricao.startsWith('Mensalidade')).dados;
  assert.ok(rec('mensal').contrato_id);                      // mensalidade -> contrato
  assert.ok(rec('3 videos').projeto_id);                     // lote -> projeto
  assert.ok(rec('real time').projeto_id);                    // real time -> projeto
  assert.ok(!rec('real time').trabalho_id);
  assert.ok(rec('dia 2').trabalho_id);                       // dia N -> vídeo
  assert.ok(rec('Casamento Produtora').trabalho_id);         // vídeo avulso
  assert.ok(plano.ops.filter((o) => o.tabela === 'recebiveis').every((o) => o.dados.status === 'pago' && o.dados.pago_em === o.dados.vencimento));
  // o contrato mensal nasce do mês do pagamento
  const c = plano.ops.find((o) => o.tabela === 'contratos_mensais').dados;
  assert.deepEqual({ v: c.valor_mensal, d: c.dia_vencimento, i: c.inicio }, { v: 650, d: 1, i: '2026-07-01' });
});

test('montarPlano: linha sem cliente é pulada e contada', () => {
  const ls = classificadas();
  porTexto(ls, 'Cliente Desconhecido').incluir = true;   // o usuário forçou, mas não há cliente
  const plano = I.montarPlano(ls, {}, {});
  assert.equal(plano.semCliente, 1);
  assert.equal(plano.novos.recebiveis, 12);
});

// ─── Executar e reimportar ───────────────────────────────────────
function bancoFalso() {
  const t = { clientes: [], projetos: [], contratos_mensais: [], clientes_cobranca: [], trabalhos: [], recebiveis: [] };
  let n = 0;
  const criar = async (tabela, dados) => { const l = { id: 'id' + (++n), ...dados }; t[tabela].push(l); return l; };
  return { t, criar };
}

test('executarPlano grava tudo, com os ids reais no lugar dos tmp', async () => {
  const { t, criar } = bancoFalso();
  const cats = { casamento: 'cat-casamento', podcast: 'cat-podcast', 'real time': 'cat-rt' };
  const plano = I.montarPlano(classificadas(), {}, {});
  const r = await I.executarPlano(criar, plano.ops, cats);
  assert.equal(r.criados, plano.ops.length);
  assert.equal(t.recebiveis.length, 12);
  assert.equal(t.trabalhos.length, 12);
  // nenhum 'tmp:' sobrou
  assert.ok(!JSON.stringify(t).includes('tmp:'));
  // todo recebível aponta para algo que existe
  const ids = new Set(Object.values(t).flat().map((x) => x.id));
  t.recebiveis.forEach((r2) => {
    for (const k of ['cliente_id', 'projeto_id', 'trabalho_id', 'contrato_id']) if (r2[k]) assert.ok(ids.has(r2[k]), k);
  });
  // categoria resolvida por nome; a que não existe na lista fica sem
  assert.equal(t.trabalhos.find((x) => x.titulo === 'Casamento').categoria_id, 'cat-casamento');
  assert.equal(t.trabalhos.find((x) => x.titulo === 'Imobiliário').categoria_id, undefined);
  assert.ok(!('_categoria_nome' in t.trabalhos[0]));
});

test('reimportar a mesma planilha não duplica nada', async () => {
  const { t, criar } = bancoFalso();
  const p1 = I.montarPlano(classificadas(), {}, {});
  await I.executarPlano(criar, p1.ops, {});
  const antes = JSON.stringify(t);

  const p2 = I.montarPlano(classificadas(), { clientes: t.clientes, projetos: t.projetos, contratos_mensais: t.contratos_mensais, recebiveis: t.recebiveis }, {});
  assert.equal(p2.jaImportadas, 12);
  assert.equal(p2.ops.length, 0);
  await I.executarPlano(criar, p2.ops, {});
  assert.equal(JSON.stringify(t), antes);
});

test('de ponta a ponta: depois de importar, a receita atribuída bate com a planilha', async () => {
  const { t, criar } = bancoFalso();
  await I.executarPlano(criar, I.montarPlano(classificadas(), {}, {}).ops, {});
  const fatias = D.atribuirReceita({ ...t, clientes: t.clientes });
  // as fatias somam exatamente o que entrou
  assert.equal(D.somar(fatias, (f) => f.valor), 1715);
  // o lote de 3 vídeos por R$ 90 rende R$ 30 em cada vídeo
  const lote = fatias.filter((f) => f.tipo === 'projeto');
  const doLote = lote.filter((f) => t.projetos.find((p) => p.id === f.projeto_id)?.nome.includes('lote de 3'));
  assert.deepEqual(doLote.map((f) => f.valor), [30, 30, 30]);
  // por mês de pagamento: o mesmo da planilha
  const porMes = {};
  fatias.forEach((f) => { const m = D.mesDe(f.data); porMes[m] = D.deCentavos((D.centavos(porMes[m] || 0)) + D.centavos(f.valor)); });
  assert.deepEqual(porMes, { '2026-05': 215, '2026-06': 490, '2026-07': 1010 });
});

// ─── Projeto revelado por outra linha ────────────────────────────
test('um projeto revelado por "real time X" também recebe as entradas "X" do mesmo cliente', () => {
  const tsv = [
    'Data\tNome\tCategoria\tValor',
    '10/06/2026\treal time Festival Beta Produtora Exemplo\tEdição\tR$ 100,00',
    '20/06/2026\tFestival Beta Produtora Exemplo\tEdição\tR$ 200,00',
    // mesmo texto, outro cliente: NÃO é o mesmo projeto
    '21/06/2026\tFestival Beta Casal Exemplo\tEdição\tR$ 50,00',
  ].join('\n');
  const ls = I.classificar(I.lerTabela(tsv), OPCOES);
  assert.equal(ls[0].projetoNome, 'Festival Beta');
  assert.equal(ls[1].projetoNome, 'Festival Beta');
  assert.equal(ls[2].projetoNome, '');

  const plano = I.montarPlano(ls, {}, {});
  assert.equal(plano.novos.projetos, 1);       // um projeto só, para as duas entradas da produtora
  assert.equal(plano.novos.trabalhos, 1);      // só o vídeo solto do outro cliente
  const aoProjeto = plano.ops.filter((o) => o.tabela === 'recebiveis' && o.dados.projeto_id);
  assert.equal(aoProjeto.length, 2);
  assert.equal(aoProjeto[0].dados.projeto_id, aoProjeto[1].dados.projeto_id);
});
