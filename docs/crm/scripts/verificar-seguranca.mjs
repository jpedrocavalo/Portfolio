#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════
   Verifica a segurança do CRM contra um projeto Supabase REAL
   --------------------------------------------------------------------
   NÃO roda sozinho e não foi executado: precisa do projeto Supabase novo
   já criado, com 0001/0002/0003 aplicados e um usuário de teste com a 2FA
   (TOTP) já inscrita. Só usa Node nativo (fetch e crypto), sem instalar nada.

   Variáveis de ambiente:
     SUPABASE_URL          https://<ref>.supabase.co
     SUPABASE_ANON_KEY     chave pública (anon)
     TEST_EMAIL            usuário de teste (pode ser o seu)
     TEST_PASSWORD         senha desse usuário
     TEST_TOTP_SECRET      segredo base32 da 2FA desse usuário
   Opcionais, para provar o isolamento entre donos (um 2º usuário):
     OTHER_EMAIL, OTHER_PASSWORD, OTHER_TOTP_SECRET

   Uso:
     SUPABASE_URL=... SUPABASE_ANON_KEY=... TEST_EMAIL=... \
       TEST_PASSWORD=... TEST_TOTP_SECRET=... \
       node docs/crm/scripts/verificar-seguranca.mjs

   O que prova:
     1. sem login nada lê e nada escreve
     2. com login mas SEM 2FA (aal1) nada lê e nada escreve
     3. com 2FA (aal2) lê e escreve o que é seu
     4. (se houver 2º usuário) um dono não enxerga a linha do outro
     5. a auditoria só aceita inserir: editar e apagar não funcionam
   Cada teste de escrita limpa o que criou.
   ════════════════════════════════════════════════════════════════════ */
import { createHmac } from 'node:crypto';

const env = process.env;
const faltam = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'TEST_EMAIL', 'TEST_PASSWORD', 'TEST_TOTP_SECRET']
  .filter((k) => !env[k]);
if (faltam.length) {
  console.error('Faltam variáveis de ambiente:', faltam.join(', '));
  process.exit(2);
}

const URL_BASE = env.SUPABASE_URL.replace(/\/$/, '');
const ANON = env.SUPABASE_ANON_KEY;
const MARCA = 'TESTE-SEGURANCA-' + Date.now();

// ─── TOTP (RFC 6238) com Node nativo ─────────────────────────────────
function base32(s) {
  const alfa = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const c of s.replace(/=+$/, '').replace(/\s/g, '').toUpperCase()) {
    const i = alfa.indexOf(c);
    if (i < 0) throw new Error('segredo TOTP inválido');
    bits += i.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}
function totp(segredo) {
  const passo = Math.floor(Date.now() / 1000 / 30);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(passo));
  const h = createHmac('sha1', base32(segredo)).update(buf).digest();
  const o = h[h.length - 1] & 0xf;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, '0');
}

// ─── HTTP ────────────────────────────────────────────────────────────
async function http(caminho, { token, metodo = 'GET', corpo, extra = {} } = {}) {
  const r = await fetch(URL_BASE + caminho, {
    method: metodo,
    headers: {
      apikey: ANON,
      Authorization: 'Bearer ' + (token || ANON),
      'Content-Type': 'application/json',
      ...extra,
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  let json = null;
  try { json = await r.json(); } catch (_) { /* corpo vazio */ }
  return { status: r.status, json };
}

async function entrar(email, senha) {
  const r = await http('/auth/v1/token?grant_type=password', { metodo: 'POST', corpo: { email, password: senha } });
  if (r.status !== 200) throw new Error('login falhou (' + r.status + ')');
  return r.json; // { access_token, user, ... }
}

async function subirParaAal2(sessao, segredo) {
  const fator = (sessao.user.factors || []).find((f) => f.factor_type === 'totp' && f.status === 'verified');
  if (!fator) throw new Error('o usuário não tem fator TOTP verificado');
  const ch = await http(`/auth/v1/factors/${fator.id}/challenge`, { metodo: 'POST', token: sessao.access_token, corpo: {} });
  if (ch.status !== 200) throw new Error('challenge falhou (' + ch.status + ')');
  const v = await http(`/auth/v1/factors/${fator.id}/verify`, {
    metodo: 'POST', token: sessao.access_token, corpo: { challenge_id: ch.json.id, code: totp(segredo) },
  });
  if (v.status !== 200) throw new Error('verificação da 2FA falhou (' + v.status + ')');
  return v.json.access_token;
}

// ─── Relatório ───────────────────────────────────────────────────────
const resultados = [];
function conferir(nome, ok, detalhe = '') {
  resultados.push({ nome, ok });
  console.log((ok ? '  OK    ' : '  FALHOU ') + nome + (detalhe ? '  [' + detalhe + ']' : ''));
}
const vazioOuNegado = (r) =>
  r.status === 401 || r.status === 403 || (r.status === 200 && Array.isArray(r.json) && r.json.length === 0);
const escritaNegada = (r) => r.status !== 201 && r.status !== 200 && r.status !== 204;

// ─── Testes ──────────────────────────────────────────────────────────
console.log('\n1. Sem login (somente a chave anon)');
{
  const r = await http('/rest/v1/clientes?select=id');
  conferir('ler clientes devolve vazio ou nega', vazioOuNegado(r), 'status ' + r.status);
  const w = await http('/rest/v1/clientes', { metodo: 'POST', corpo: { nome: MARCA }, extra: { Prefer: 'return=minimal' } });
  conferir('inserir cliente é negado', escritaNegada(w), 'status ' + w.status);
}

console.log('\n2. Com login, SEM 2FA (aal1)');
const sessao = await entrar(env.TEST_EMAIL, env.TEST_PASSWORD);
{
  const t1 = sessao.access_token;
  const r = await http('/rest/v1/clientes?select=id', { token: t1 });
  conferir('ler clientes devolve vazio ou nega', vazioOuNegado(r), 'status ' + r.status);
  const w = await http('/rest/v1/clientes', { metodo: 'POST', token: t1, corpo: { nome: MARCA }, extra: { Prefer: 'return=minimal' } });
  conferir('inserir cliente é negado', escritaNegada(w), 'status ' + w.status);
}

console.log('\n3. Com 2FA (aal2)');
const tokenA = await subirParaAal2(sessao, env.TEST_TOTP_SECRET);
let idCriado = null;
{
  const w = await http('/rest/v1/clientes', {
    metodo: 'POST', token: tokenA, corpo: { nome: MARCA }, extra: { Prefer: 'return=representation' },
  });
  conferir('inserir cliente funciona', w.status === 201 && Array.isArray(w.json) && w.json[0]?.id, 'status ' + w.status);
  idCriado = w.json?.[0]?.id ?? null;
  const r = await http(`/rest/v1/clientes?nome=eq.${MARCA}&select=id,dono`, { token: tokenA });
  conferir('ler o que criou funciona', r.status === 200 && r.json?.length === 1, 'status ' + r.status);
  conferir('o dono da linha é o usuário logado', r.json?.[0]?.dono === sessao.user.id);
}

console.log('\n4. Isolamento entre donos');
if (env.OTHER_EMAIL && env.OTHER_PASSWORD && env.OTHER_TOTP_SECRET) {
  const s2 = await entrar(env.OTHER_EMAIL, env.OTHER_PASSWORD);
  const tokenB = await subirParaAal2(s2, env.OTHER_TOTP_SECRET);
  const r = await http(`/rest/v1/clientes?nome=eq.${MARCA}&select=id`, { token: tokenB });
  conferir('o 2º usuário (com 2FA) NÃO enxerga a linha do 1º', r.status === 200 && r.json?.length === 0, 'status ' + r.status);
  if (idCriado) {
    const d = await http(`/rest/v1/clientes?id=eq.${idCriado}`, { metodo: 'DELETE', token: tokenB, extra: { Prefer: 'return=representation' } });
    conferir('o 2º usuário NÃO consegue apagar a linha do 1º', !(Array.isArray(d.json) && d.json.length > 0), 'status ' + d.status);
  }
} else {
  console.log('  (pulado: defina OTHER_EMAIL, OTHER_PASSWORD e OTHER_TOTP_SECRET para testar)');
}

console.log('\n5. Auditoria só acrescenta');
{
  const w = await http('/rest/v1/auditoria', {
    metodo: 'POST', token: tokenA, corpo: { acao: MARCA }, extra: { Prefer: 'return=representation' },
  });
  conferir('inserir na auditoria funciona', w.status === 201, 'status ' + w.status);
  const id = w.json?.[0]?.id;
  if (id) {
    const u = await http(`/rest/v1/auditoria?id=eq.${id}`, { metodo: 'PATCH', token: tokenA, corpo: { acao: 'ALTERADO' }, extra: { Prefer: 'return=representation' } });
    conferir('editar a auditoria é negado', !(u.status === 200 && Array.isArray(u.json) && u.json.length > 0), 'status ' + u.status);
    const d = await http(`/rest/v1/auditoria?id=eq.${id}`, { metodo: 'DELETE', token: tokenA, extra: { Prefer: 'return=representation' } });
    conferir('apagar da auditoria é negado', !(d.status === 200 && Array.isArray(d.json) && d.json.length > 0), 'status ' + d.status);
  }
}

// ─── Limpeza ─────────────────────────────────────────────────────────
if (idCriado) await http(`/rest/v1/clientes?id=eq.${idCriado}`, { metodo: 'DELETE', token: tokenA });
console.log('\n(A linha de auditoria do teste fica, por desenho: a tabela não deixa apagar.)');

const falhas = resultados.filter((r) => !r.ok).length;
console.log(`\n${resultados.length - falhas} de ${resultados.length} verificações passaram.`);
process.exit(falhas ? 1 : 0);
