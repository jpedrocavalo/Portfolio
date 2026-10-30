// Testes da análise dos gráficos. Rodar: node --test "docs/crm/testes/*.test.mjs"
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const D = require('../../../project/crm/dominio.js');
const A = require('../../../project/crm/analise.js');

// Tudo fictício
const t = {
  clientes: [{ id: 'c1', nome: 'Cliente Um' }, { id: 'c2', nome: 'Cliente Dois' }],
  categorias_video: [{ id: 'k1', nome: 'Casamento' }, { id: 'k2', nome: 'Evento' }],
  servicos: [{ id: 's1', nome: 'Edição' }],
  projetos: [{ id: 'p1', cliente_id: 'c1', nome: 'Projeto X' }],
  contratos_mensais: [{ id: 'm1', cliente_id: 'c2', valor_mensal: 1000 }],
  trabalhos: [
    { id: 'a', cliente_id: 'c1', projeto_id: 'p1', servico_id: 's1', categoria_id: 'k1', entregue_em: '2026-03-10' },
    { id: 'b', cliente_id: 'c1', projeto_id: 'p1', servico_id: 's1', categoria_id: 'k2', entregue_em: '2026-03-12' },
    { id: 'c', cliente_id: 'c2', projeto_id: null, servico_id: 's1', categoria_id: 'k2', entregue_em: '2026-04-02' },
    { id: 'd', cliente_id: 'c2', projeto_id: null, servico_id: null, categoria_id: null, entregue_em: '2026-04-20' },
    { id: 'e', cliente_id: 'c1', projeto_id: null, servico_id: 's1', categoria_id: 'k1', entregue_em: '2025-12-05' },
  ],
  recebiveis: [
    { id: 'r1', cliente_id: 'c1', projeto_id: 'p1', status: 'pago', valor: 1000.01, vencimento: '2026-03-15', pago_em: '2026-03-16' },
    { id: 'r2', cliente_id: 'c2', contrato_id: 'm1', status: 'pago', valor: 1000, vencimento: '2026-04-05', pago_em: '2026-04-05' },
    { id: 'r3', cliente_id: 'c1', trabalho_id: 'e', status: 'pago', valor: 300, vencimento: '2025-12-10', pago_em: '2025-12-10' },
    { id: 'r4', cliente_id: 'c2', contrato_id: 'm1', status: 'a_receber', valor: 1000, vencimento: '2026-05-05', pago_em: null },
  ],
};
const fatias = D.atribuirReceita(t);
const centavos = (n) => D.centavos(n);

test('todo agrupamento fecha com o total filtrado', () => {
  const base = A.filtrar(fatias, { base: 'caixa' });
  const total = A.soma(base);
  assert.equal(centavos(total), centavos(2300.01));
  for (const dim of Object.keys(A.DIMENSOES)) {
    const soma = A.agrupar(base, dim, t).reduce((s, g) => s + centavos(g.valor), 0);
    assert.equal(soma, centavos(total), 'dimensão ' + dim);
  }
});

test('caixa ignora o em aberto, previsto soma', () => {
  assert.equal(A.soma(A.filtrar(fatias, { base: 'caixa' })), 2300.01);
  assert.equal(A.soma(A.filtrar(fatias, { base: 'previsto' })), 3300.01);
});

test('projeto de 2 vídeos divide em centavos; mensal rateia entre os entregues do mês', () => {
  const porCategoria = A.agrupar(A.filtrar(fatias, { base: 'caixa' }), 'categoria', t);
  const k = (id) => porCategoria.find((g) => g.chave === id);
  // r1 (1000,01) divide 500,01 + 500,00; mensal de abril (1000) divide 500 + 500 entre c (k2) e d (sem categoria)
  assert.equal(k('k1').valor, 500.01 + 300);
  assert.equal(k('k2').valor, 500 + 500);
  assert.equal(porCategoria.find((g) => g.chave === '').valor, 500);
});

test('filtro por cliente e por período', () => {
  const so = A.filtrar(fatias, { base: 'caixa', cliente_id: 'c2' });
  assert.equal(A.soma(so), 1000);
  const q1 = A.filtrar(fatias, { base: 'caixa', de: '2026-01-01', ate: '2026-03-31' });
  assert.equal(A.soma(q1), 1000.01);
});

test('porMes traz todos os meses do intervalo, inclusive os vazios', () => {
  const base = A.filtrar(fatias, { base: 'caixa' });
  const m = A.porMes(base, t.trabalhos, '2025-12', '2026-04');
  assert.deepEqual(m.map((x) => x.mes), ['2025-12', '2026-01', '2026-02', '2026-03', '2026-04']);
  assert.equal(m[1].valor, 0);
  assert.equal(m[3].valor, 1000.01);
  assert.deepEqual(m.map((x) => x.videos), [1, 0, 0, 2, 2]);
});

test('porAno soma por ano e conta vídeos entregues', () => {
  const base = A.filtrar(fatias, { base: 'caixa' });
  const a = A.porAno(base, t.trabalhos);
  assert.deepEqual(a.map((x) => x.ano), [2025, 2026]);
  assert.equal(a[0].valor, 300);
  assert.equal(a[1].valor, 2000.01);
  assert.deepEqual(a.map((x) => x.videos), [1, 4]);
});
