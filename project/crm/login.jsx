/* ════════════════════════════════════════════════════════════════
   CRM: LOGIN (e-mail + senha, depois código de 2FA)
   --------------------------------------------------------------
   Só aparece no modo Supabase. NÃO foi testado contra um projeto real.
   Não há botão de criar conta de propósito: a conta nasce no painel do
   Supabase e o cadastro público fica desligado.
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useEffect } = React;
  const { Botao, Entrada, Aviso } = window.CRMUI;

  // sessao: null | { email, passo: 'mfa' | 'mfa_cadastro' }
  function Login({ dados, sessao, aoConcluir }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [codigo, setCodigo] = useState('');
    const [passo, setPasso] = useState(sessao ? sessao.passo : 'login');
    const [qr, setQr] = useState(null);
    const [ocupado, setOcupado] = useState(false);
    const [erro, setErro] = useState('');

    // Cadastro do autenticador: gera o QR assim que o passo pede
    useEffect(() => {
      if (passo !== 'mfa_cadastro' || qr) return;
      dados.auth.iniciarCadastroMfa().then(setQr).catch((e) => setErro(e.message));
    }, [passo]);

    async function rodar(fn) {
      setOcupado(true); setErro('');
      try { await fn(); } catch (e) { setErro(e.message || 'Algo deu errado.'); }
      setOcupado(false);
    }

    const entrar = (e) => {
      e.preventDefault();
      rodar(async () => {
        await dados.auth.entrar(email.trim(), senha);
        const s = await dados.auth.sessao();
        if (!s) throw new Error('Não consegui entrar.');
        if (s.passo === 'ok') aoConcluir(); else setPasso(s.passo);
      });
    };
    const confirmar = (e) => {
      e.preventDefault();
      rodar(async () => {
        const c = codigo.replace(/\s/g, '');
        if (passo === 'mfa_cadastro') await dados.auth.confirmarCadastroMfa(qr.fatorId, c);
        else await dados.auth.verificarMfa(c);
        aoConcluir();
      });
    };

    return (
      <div className="crm-login">
        <div className="caixa">
          <h1>CRM</h1>
          <div className="crm-mudo">{passo === 'login' ? 'Acesso restrito.' : passo === 'mfa' ? 'Digite o código do seu app autenticador.' : 'Cadastre o app autenticador (2FA).'}</div>
          {erro && <div style={{ marginTop: 12 }}><Aviso tom="erro">{erro}</Aviso></div>}

          {passo === 'login' && (
            <form className="form" onSubmit={entrar}>
              <Entrada rotulo="E-mail" tipo="email" valor={email} onChange={setEmail} autoComplete="username" required />
              <Entrada rotulo="Senha" tipo="password" valor={senha} onChange={setSenha} autoComplete="current-password" required />
              <Botao type="submit" disabled={ocupado}>{ocupado ? 'Entrando…' : 'Entrar'}</Botao>
            </form>
          )}

          {passo !== 'login' && (
            <form className="form" onSubmit={confirmar}>
              {passo === 'mfa_cadastro' && (qr ? (
                <div>
                  <div className="crm-pequeno crm-mudo">Escaneie no app (Google Authenticator, 1Password…). Sem câmera, digite a chave abaixo.</div>
                  <img src={qr.qr} alt="QR code do autenticador" />
                  <code>{qr.segredo}</code>
                </div>
              ) : <div className="crm-mudo">Gerando o QR…</div>)}
              <Entrada rotulo="Código de 6 dígitos" valor={codigo} onChange={setCodigo} inputMode="numeric" autoComplete="one-time-code" maxLength={7} required />
              <Botao type="submit" disabled={ocupado || (passo === 'mfa_cadastro' && !qr)}>{ocupado ? 'Verificando…' : 'Confirmar'}</Botao>
              <Botao variante="texto" onClick={async () => { await dados.auth.sair(); setPasso('login'); setQr(null); setCodigo(''); }}>Voltar</Botao>
            </form>
          )}
        </div>
      </div>
    );
  }

  window.CRMTelas = window.CRMTelas || {};
  window.CRMTelas.Login = Login;
})();
