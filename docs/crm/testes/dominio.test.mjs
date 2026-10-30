// Testes da lógica de negócio do CRM. Rode com:
//   node --test "docs/crm/testes/*.test.mjs"
// Só dados fictícios.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const D = require('../../../project/crm/dominio.js');

// ─── Dinheiro ────────────────────────────────────────────────────
test('fmtBRL formata em reais, com milhar e vírgula', () => {
  assert.equal(D.fmtBRL(1234.5), 'R$ 1.234,50');
  assert.equal(D.fmtBRL(0), 'R$ 0,00');
  assert.equal(D.fmtBRL(1234567.891), 'R$ 1.234.567,89');
  assert.equal(D.fmtBRL(-25), '-R$ 25,00');
});

test('parseBRL entende o formato da planilha e variações', () => {
  assert.equal(D.parseBRL('R$ 1.234,56'), 1234.56);
  assert.equal(D.parseBRL('R$ 25,00'), 25);
  assert.equal(D.parseBRL('150,00'), 150);
  assert.equal(D.parseBRL('1234.56'), 1234.56);
  assert.equal(D.parseBRL('R$ 1.000'), 1000);
  assert.ok(Number.isNaN(D.parseBRL('')));
  assert.ok(Number.isNaN(D.parseBRL('abc')));
});

test('dividirIgual reparte em centavos e a soma é exata', () => {
  assert.deepEqual(D.dividirIgual(100, 3), [33.34, 33.33, 33.33]);
  assert.deepEqual(D.dividirIgual(800, 3), [266.67, 266.67, 266.66]);
  assert.deepEqual(D.dividirIgual(50, 1), [50]);
  assert.deepEqual(D.dividirIgual(10, 0), []);
  for (const [v, n] of [[0.01, 3], [99.99, 7], [1234.56, 11], [0, 4]]) {
    const partes = D.dividirIgual(v, n);
    assert.equal(partes.length, n);
    assert.equal(D.somar(partes, (x) => x), v, `soma de ${v} em ${n}`);
  }
});

// ─── Datas ───────────────────────────────────────────────────────
test('datas: validar, converter e somar meses', () => {
  assert.equal(D.parseDataBR('29/05/2026'), '2026-05-29');
  assert.equal(D.parseDataBR('9/6/2026'), '2026-06-09');
  assert.equal(D.parseDataBR('31/02/2026'), null);
  assert.equal(D.parseDataBR('2026-05-29'), null);
  assert.equal(D.fmtData('2026-10-01'), '01/10/2026');
  assert.equal(D.fmtMes('2026-10'), 'out/2026');
  assert.equal(D.addMeses('2026-01-31', 1), '2026-02-28');
  assert.equal(D.addMeses('2026-12-15', 2), '2027-02-15');
  assert.equal(D.addMeses('2026-03-15', -4), '2025-11-15');
  assert.equal(D.addDias('2026-02-27', 3), '2026-03-02');
  assert.equal(D.diffDias('2026-10-01', '2026-10-31'), 30);
  assert.equal(D.isoValido('2026-02-29'), false);
  assert.equal(D.isoValido('2028-02-29'), true);
});

// ─── Mensalidades ────────────────────────────────────────────────
test('gerarMensalidades cria uma por mês até o limite e não duplica', () => {
  const c = { id: 'c1', cliente_id: 'k1', valor_mensal: 800, dia_vencimento: 5, inicio: '2026-10-01', ativo: true };
  const todas = D.gerarMensalidades(c, [], '2026-12-20');
  assert.deepEqual(todas.map((r) => r.vencimento), ['2026-10-05', '2026-11-05', '2026-12-05']);
  assert.ok(todas.every((r) => r.valor === 800 && r.contrato_id === 'c1' && r.status === 'a_receber'));
  assert.equal(todas[0].descricao, 'Mensalidade out/2026');

  const ja = [{ contrato_id: 'c1', vencimento: '2026-10-05' }];
  assert.deepEqual(D.gerarMensalidades(c, ja, '2026-12-20').map((r) => r.vencimento), ['2026-11-05', '2026-12-05']);
  // rodar de novo com tudo já criado não gera nada
  assert.equal(D.gerarMensalidades(c, todas, '2026-12-20').length, 0);
});

test('gerarMensalidades respeita fim, início no meio do mês e contrato inativo', () => {
  const base = { id: 'c1', cliente_id: 'k1', valor_mensal: 500, dia_vencimento: 5, ativo: true };
  // começa dia 10 e vence dia 5: a de outubro já passou, a primeira é novembro
  const meio = D.gerarMensalidades({ ...base, inicio: '2026-10-10' }, [], '2026-12-31');
  assert.deepEqual(meio.map((r) => r.vencimento), ['2026-11-05', '2026-12-05']);
  // fim em novembro corta dezembro
  const comFim = D.gerarMensalidades({ ...base, inicio: '2026-10-01', fim: '2026-11-30' }, [], '2026-12-31');
  assert.deepEqual(comFim.map((r) => r.vencimento), ['2026-10-05', '2026-11-05']);
  assert.equal(D.gerarMensalidades({ ...base, inicio: '2026-10-01', ativo: false }, [], '2026-12-31').length, 0);
  // dia fora de faixa é limitado a 28
  assert.equal(D.gerarMensalidades({ ...base, inicio: '2026-02-01', dia_vencimento: 31 }, [], '2026-02-28')[0].vencimento, '2026-02-28');
});

test('statusEfetivo: aberto vencido vira atrasado', () => {
  assert.equal(D.statusEfetivo({ status: 'pago', vencimento: '2026-01-01' }, '2026-10-30'), 'pago');
  assert.equal(D.statusEfetivo({ status: 'a_receber', vencimento: '2026-10-29' }, '2026-10-30'), 'atrasado');
  assert.equal(D.statusEfetivo({ status: 'a_receber', vencimento: '2026-10-30' }, '2026-10-30'), 'a_receber');
  assert.equal(D.statusEfetivo({ status: 'cancelado', vencimento: '2020-01-01' }, '2026-10-30'), 'cancelado');
});

// ─── Atribuição da receita ───────────────────────────────────────
// Cenário fictício: um avulso, um projeto com 3 vídeos, um mensalista
const cenario = () => ({
  clientes: [{ id: 'A' }, { id: 'B' }],
  projetos: [{ id: 'P', cliente_id: 'A', nome: 'Projeto Exemplo' }],
  trabalhos: [
    { id: 'w1', cliente_id: 'A', servico_id: 's1', categoria_id: 'c1' },
    { id: 'p1', cliente_id: 'A', projeto_id: 'P', servico_id: 's1', categoria_id: 'c2' },
    { id: 'p2', cliente_id: 'A', projeto_id: 'P', servico_id: 's1', categoria_id: 'c2' },
    { id: 'p3', cliente_id: 'A', projeto_id: 'P', servico_id: 's2', categoria_id: 'c3' },
    // do mensalista, entregues em outubro (3) e nenhum em novembro
    { id: 'm1', cliente_id: 'B', servico_id: 's1', categoria_id: 'c1', entregue_em: '2026-10-03' },
    { id: 'm2', cliente_id: 'B', servico_id: 's1', categoria_id: 'c1', entregue_em: '2026-10-17' },
    { id: 'm3', cliente_id: 'B', servico_id: 's1', categoria_id: 'c2', entregue_em: '2026-10-28' },
  ],
  contratos_mensais: [{ id: 'k', cliente_id: 'B', valor_mensal: 800 }],
  recebiveis: [
    { id: 'r1', cliente_id: 'A', trabalho_id: 'w1', valor: 100, vencimento: '2026-09-10', status: 'pago', pago_em: '2026-09-12' },
    { id: 'r2', cliente_id: 'A', projeto_id: 'P', valor: 100, vencimento: '2026-10-01', status: 'pago', pago_em: '2026-10-01' },
    { id: 'r3', cliente_id: 'B', contrato_id: 'k', valor: 800, vencimento: '2026-10-05', status: 'pago', pago_em: '2026-10-06' },
    { id: 'r4', cliente_id: 'B', contrato_id: 'k', valor: 800, vencimento: '2026-11-05', status: 'a_receber' },
    { id: 'r5', cliente_id: 'A', valor: 40, vencimento: '2026-10-02', status: 'pago', pago_em: '2026-10-02' },
    { id: 'r6', cliente_id: 'A', trabalho_id: 'w1', valor: 999, vencimento: '2026-10-09', status: 'cancelado' },
  ],
});

const dePagamento = (fatias, id) => fatias.filter((f) => f.recebivel_id === id);
const soma = (fs) => D.somar(fs, (f) => f.valor);

test('atribuirReceita: a soma das fatias de cada recebível é o valor dele', () => {
  const t = cenario();
  const fatias = D.atribuirReceita(t);
  t.recebiveis.filter((r) => r.status !== 'cancelado').forEach((r) => {
    assert.equal(soma(dePagamento(fatias, r.id)), r.valor, 'recebível ' + r.id);
  });
});

test('atribuirReceita: cancelado não gera fatia', () => {
  assert.equal(dePagamento(D.atribuirReceita(cenario()), 'r6').length, 0);
});

test('atribuirReceita: ligado a trabalho leva as dimensões dele', () => {
  const [f] = dePagamento(D.atribuirReceita(cenario()), 'r1');
  assert.deepEqual(
    { v: f.valor, c: f.cliente_id, s: f.servico_id, cat: f.categoria_id, tipo: f.tipo, data: f.data, real: f.realizado },
    { v: 100, c: 'A', s: 's1', cat: 'c1', tipo: 'avulso', data: '2026-09-12', real: true },
  );
});

test('atribuirReceita: pagamento de projeto se divide igual entre os vídeos', () => {
  const fs = dePagamento(D.atribuirReceita(cenario()), 'r2');
  assert.deepEqual(fs.map((f) => f.valor), [33.34, 33.33, 33.33]);
  assert.deepEqual(fs.map((f) => f.trabalho_id), ['p1', 'p2', 'p3']);
  assert.ok(fs.every((f) => f.projeto_id === 'P' && f.tipo === 'projeto'));
  // a categoria c2 recebe a fatia de dois vídeos
  assert.equal(soma(fs.filter((f) => f.categoria_id === 'c2')), 66.67);
});

test('atribuirReceita: mensalidade se divide entre os vídeos entregues no mês', () => {
  const fs = dePagamento(D.atribuirReceita(cenario()), 'r3');
  assert.deepEqual(fs.map((f) => f.valor), [266.67, 266.67, 266.66]);
  assert.ok(fs.every((f) => f.tipo === 'mensal' && f.cliente_id === 'B'));
  // a data da fatia é a do pagamento (caixa), não a da entrega
  assert.ok(fs.every((f) => f.data === '2026-10-06' && f.realizado));
});

test('atribuirReceita: mensalidade de mês sem entrega fica fora de categoria e serviço', () => {
  const [f] = dePagamento(D.atribuirReceita(cenario()), 'r4');
  assert.deepEqual(
    { tipo: f.tipo, c: f.cliente_id, s: f.servico_id, cat: f.categoria_id, p: f.projeto_id, data: f.data, real: f.realizado },
    { tipo: 'mensal_sem_entrega', c: 'B', s: null, cat: null, p: null, data: '2026-11-05', real: false },
  );
});

test('atribuirReceita: entrada só de cliente fica sem vídeo', () => {
  const [f] = dePagamento(D.atribuirReceita(cenario()), 'r5');
  assert.equal(f.tipo, 'avulso_sem_video');
  assert.equal(f.cliente_id, 'A');
  assert.equal(f.trabalho_id, null);
});

test('atribuirReceita: projeto sem vídeos mantém o valor no projeto', () => {
  const t = cenario();
  t.recebiveis = [{ id: 'x', cliente_id: 'A', projeto_id: 'VAZIO', valor: 70, vencimento: '2026-10-01', status: 'pago', pago_em: '2026-10-01' }];
  t.projetos.push({ id: 'VAZIO', cliente_id: 'A', nome: 'Sem vídeos' });
  const [f] = D.atribuirReceita(t);
  assert.equal(f.tipo, 'projeto_sem_video');
  assert.equal(f.projeto_id, 'VAZIO');
  assert.equal(f.valor, 70);
});

// ─── Resumos ─────────────────────────────────────────────────────
test('resumoDoMes soma o que entrou, o que falta e o que atrasou', () => {
  const t = cenario();
  t.recebiveis.push({ id: 'r7', cliente_id: 'A', valor: 60, vencimento: '2026-10-20', status: 'a_receber' });
  const r = D.resumoDoMes(t, '2026-10', '2026-10-30');
  assert.equal(r.recebido, 940);                // 100 + 800 + 40
  assert.equal(r.qtdRecebidos, 3);
  assert.equal(r.atrasado, 60);                 // r7 venceu dia 20
  assert.equal(r.qtdAtrasados, 1);
  assert.equal(r.aReceber30d, 800);             // r4, vence 05/11
  assert.equal(r.entregues, 3);
});

test('acumuladoDoAno e o limite', () => {
  const a = D.acumuladoDoAno(cenario(), 2026, 81000);
  assert.equal(a.total, 1040);                   // 100 + 100 + 800 + 40
  assert.ok(Math.abs(a.pct - 1040 / 81000) < 1e-12);
  assert.equal(D.acumuladoDoAno(cenario(), 2025, 81000).total, 0);
  assert.equal(D.acumuladoDoAno(cenario(), 2026).pct, null);
});
