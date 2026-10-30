/* ════════════════════════════════════════════════════════════════
   CRM: ADAPTADOR DO SUPABASE
   --------------------------------------------------------------
   AINDA NÃO FOI TESTADO CONTRA UM PROJETO REAL (não existia projeto
   Supabase quando foi escrito). A forma das chamadas segue a
   documentação do supabase-js v2; a primeira conexão de verdade deve
   ser feita com atenção.

   Login: e-mail + senha, depois código de 6 dígitos (TOTP). Não existe
   cadastro pela página: a conta é criada no painel do Supabase, com o
   cadastro público desligado. Sem o código de 2FA a sessão fica em aal1
   e o RLS (0002_rls.sql) não deixa ler nem escrever nada.
   ════════════════════════════════════════════════════════════════ */
(function (raiz) {
  const TABELAS = ['clientes', 'clientes_cobranca', 'contratos_mensais', 'categorias_video', 'servicos',
    'projetos', 'trabalhos', 'recebiveis', 'despesas', 'leads', 'orcamentos', 'tarefas', 'interacoes',
    'modelos_mensagem', 'metas', 'config'];
  const PAGINA = 1000;

  // supabase-js devolve { data, error }; as telas esperam exceção
  const ok = ({ data, error }) => { if (error) throw Object.assign(new Error(error.message), { code: error.code }); return data; };

  raiz.CRM.criarSupabase = function (cfg) {
    const sb = raiz.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });

    async function lerTudo(tabela) {
      const linhas = [];
      for (let de = 0; ; de += PAGINA) {
        const lote = ok(await sb.from(tabela).select('*').order('criado_em', { ascending: true }).range(de, de + PAGINA - 1));
        linhas.push(...lote);
        if (lote.length < PAGINA) return linhas;
      }
    }

    const auth = {
      // null (sem login) | { email, passo } onde passo diz o que falta
      async sessao() {
        const { data } = await sb.auth.getSession();
        if (!data.session) return null;
        const aal = ok(await sb.auth.mfa.getAuthenticatorAssuranceLevel());
        let passo = 'ok';
        if (aal.currentLevel !== 'aal2') passo = aal.nextLevel === 'aal2' ? 'mfa' : 'mfa_cadastro';
        return { email: data.session.user.email, passo };
      },
      async entrar(email, senha) {
        ok(await sb.auth.signInWithPassword({ email, password: senha }));
      },
      async sair() { await sb.auth.signOut(); },
      // Cadastro do autenticador: devolve { fatorId, qr (svg), segredo }
      async iniciarCadastroMfa() {
        const lista = ok(await sb.auth.mfa.listFactors());
        // Fator antigo não confirmado atrapalha um novo cadastro
        for (const f of lista.all || []) if (f.factor_type === 'totp' && f.status === 'unverified') await sb.auth.mfa.unenroll({ factorId: f.id });
        const f = ok(await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'CRM ' + new Date().toISOString().slice(0, 10) }));
        return { fatorId: f.id, qr: f.totp.qr_code, segredo: f.totp.secret };
      },
      async confirmarCadastroMfa(fatorId, codigo) {
        ok(await sb.auth.mfa.challengeAndVerify({ factorId: fatorId, code: codigo }));
      },
      async verificarMfa(codigo) {
        const lista = ok(await sb.auth.mfa.listFactors());
        const fator = (lista.totp || [])[0];
        if (!fator) throw new Error('Nenhum autenticador cadastrado.');
        ok(await sb.auth.mfa.challengeAndVerify({ factorId: fator.id, code: codigo }));
      },
    };

    return {
      modo: 'supabase',
      auth,
      async carregar() {
        const resultado = {};
        await Promise.all(TABELAS.map(async (t) => { resultado[t] = await lerTudo(t); }));
        // Últimas ações registradas (a tabela é só de acrescentar)
        resultado.auditoria = ok(await sb.from('auditoria').select('*').order('em', { ascending: false }).limit(200));
        // Primeiro acesso: planta as categorias padrão (a função é idempotente)
        if (!resultado.categorias_video.length) {
          ok(await sb.rpc('crm_semear_categorias'));
          resultado.categorias_video = await lerTudo('categorias_video');
        }
        return resultado;
      },
      async criar(tabela, dados) { return ok(await sb.from(tabela).insert(dados).select().single()); },
      async atualizar(tabela, id, mudancas) { return ok(await sb.from(tabela).update(mudancas).eq('id', id).select().single()); },
      async apagar(tabela, id) { ok(await sb.from(tabela).delete().eq('id', id)); },
    };
  };
})(window);
