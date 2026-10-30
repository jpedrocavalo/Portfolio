/* ════════════════════════════════════════════════════════════════
   CRM: IMPORTAR A PLANILHA DE ENTRADAS
   --------------------------------------------------------------
   Cola (ou escolhe) a planilha, o CRM mostra o que entendeu e o que
   ficou de fora, e só grava depois do "Importar". Considera apenas a
   categoria Edição. Reimportar o mesmo arquivo não duplica.
   A lógica está em importador.js (testada em Node).
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useMemo } = React;
  const D = window.CRM.dominio;
  const I = window.CRM.importador;
  const { useCRM, Cartao, Kpi, Tag, Botao, Tabela, Area, Aviso } = window.CRMUI;

  // Exemplo FICTÍCIO, só para experimentar a tela
  const EXEMPLO = [
    'Data\tNome\tCategoria\tValor\tMês',
    '01/09/2026\tmensal Estúdio Aurora\tEdição\tR$ 2.200,00\tsetembro',
    '15/09/2026\tPodcast 20 Casa Lume Eventos\tEdição\tR$ 380,00\tsetembro',
    '20/09/2026\t3 videos Congresso Casa Lume Eventos\tEdição\tR$ 2.400,00\tsetembro',
    '22/09/2026\tReels do lançamento Marina Teixeira\tEdição\tR$ 150,00\tsetembro',
    '25/09/2026\tMentoria Marina Teixeira\tMentoria\tR$ 500,00\tsetembro',
    '28/09/2026\tEntrada Cliente Novo Exemplo\tEdição\tR$ 450,00\tsetembro',
  ].join('\n');

  function Importar() {
    const { t, hoje, dados, recarregar, agir } = useCRM();
    const [texto, setTexto] = useState('');
    const [extras, setExtras] = useState('');
    const [linhas, setLinhas] = useState(null);
    const [aviso, setAviso] = useState('');
    const [gravando, setGravando] = useState(false);
    const [feito, setFeito] = useState(null);

    const clientes = () => [
      ...t.clientes.map((c) => ({ nome: c.nome })),
      ...extras.split('\n').map((s) => s.trim()).filter(Boolean).map((nome) => ({ nome })),
    ];

    const analisar = () => {
      setFeito(null);
      const tabela = I.lerTabela(texto);
      setAviso(tabela.aviso || '');
      if (tabela.aviso) { setLinhas(null); return; }
      setLinhas(I.classificar(tabela, {
        clientes: clientes(), categoriasVideo: t.categorias_video.map((c) => c.nome),
        projetosConhecidos: t.projetos.map((p) => p.nome), categoriaAlvo: 'edicao',
      }));
    };

    const lerArquivo = (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => setTexto(String(r.result));
      r.readAsText(f);
    };

    const alternar = (n) => setLinhas((ls) => ls.map((l) => (l.n === n ? { ...l, incluir: !l.incluir } : l)));

    const resumo = useMemo(() => (linhas ? I.resumo(linhas) : null), [linhas]);
    const plano = useMemo(() => (linhas ? I.montarPlano(linhas, {
      clientes: t.clientes, projetos: t.projetos, contratos_mensais: t.contratos_mensais, recebiveis: t.recebiveis,
    }, {}) : null), [linhas, t]);

    const importar = async () => {
      if (!plano || !plano.ops.length) return;
      if (!confirm('Gravar ' + plano.novos.recebiveis + ' pagamentos (' + D.fmtBRL(plano.novos.soma) + '), ' + plano.novos.trabalhos + ' vídeos, '
        + plano.novos.projetos + ' projetos e ' + plano.novos.clientes + ' clientes novos?' + (dados.modo === 'demo' ? '\n\n(Modo demonstração: some ao recarregar a página.)' : ''))) return;
      setGravando(true);
      const categorias = {};
      t.categorias_video.forEach((c) => { categorias[D.semAcento(c.nome)] = c.id; });
      const ok = await agir(async () => {
        const r = await I.executarPlano((tabela, d) => dados.criar(tabela, d), plano.ops, categorias);
        await dados.criar('auditoria', { acao: 'importar_planilha', tabela: null, detalhe: { criados: r.criados, recebiveis: plano.novos.recebiveis } }).catch(() => null);
        setFeito(r.criados);
      });
      await recarregar();
      if (ok) { setLinhas(null); setTexto(''); }
      setGravando(false);
    };

    const motivos = resumo ? Object.entries(resumo.ignoradas.porMotivo) : [];
    return (
      <div>
        <div className="crm-cabeca"><div><h1>Importar planilha</h1><div className="sub">Só a categoria Edição entra. Nada é gravado antes do botão Importar.</div></div></div>

        {feito != null && <Aviso tom="ok">Pronto: {feito} registros criados.</Aviso>}

        <Cartao titulo="1. A planilha" acoes={<><Botao variante="texto" peq onClick={() => setTexto(EXEMPLO)}>colar exemplo fictício</Botao><label className="crm-btn contorno peq" style={{ cursor: 'pointer' }}>escolher arquivo<input type="file" accept=".csv,.tsv,.txt" onChange={lerArquivo} style={{ display: 'none' }} /></label></>}>
          <div className="crm-form">
            <Area rotulo="Cole aqui as linhas (Data, Nome, Categoria, Valor, Mês), direto do Google Sheets" valor={texto} onChange={setTexto} rows={7} placeholder={'Data\tNome\tCategoria\tValor'} />
            <Area rotulo="Clientes que ainda não existem no CRM (um por linha)" valor={extras} onChange={setExtras} rows={3} placeholder="O nome do cliente vem no FIM do texto da planilha" />
          </div>
          <div style={{ marginTop: 10 }}><Botao onClick={analisar} disabled={!texto.trim()}>Analisar</Botao></div>
          {aviso && <div style={{ marginTop: 10 }}><Aviso tom="erro">{aviso}</Aviso></div>}
        </Cartao>

        {resumo && (
          <>
            <div className="crm-grade c3" style={{ marginBottom: 14 }}>
              <Kpi rotulo="Vão entrar" valor={resumo.incluidas.n} sub={D.fmtBRL(resumo.incluidas.soma)} />
              <Kpi rotulo="Em dúvida (não entram sozinhas)" valor={resumo.duvidas.n} sub={D.fmtBRL(resumo.duvidas.soma)} tom={resumo.duvidas.n ? 'mal' : ''} />
              <Kpi rotulo="Fora do escopo" valor={resumo.ignoradas.n} sub={D.fmtBRL(resumo.ignoradas.soma)} />
            </div>
            {motivos.length > 0 && <div className="crm-pequeno crm-mudo" style={{ margin: '-6px 0 12px' }}>Ignoradas: {motivos.map(([m, v]) => m + ' (' + v.n + ', ' + D.fmtBRL(v.soma) + ')').join(' · ')}</div>}

            <Cartao titulo="2. Linha por linha" semMargem>
              <Tabela
                linhas={linhas.map((l) => ({ ...l, id: 'l' + l.n }))}
                classeLinha={(l) => (!l.escopo ? 'fora' : !l.incluir ? 'duvida' : '')}
                colunas={[
                  { id: 'n', titulo: '#' },
                  { id: 'data', titulo: 'Data', render: (l) => (l.data ? D.fmtData(l.data) : l.bruto.data) },
                  { id: 'nome', titulo: 'Texto da planilha', valor: (l) => l.bruto.nome, render: (l) => l.bruto.nome },
                  { id: 'cliente', titulo: 'Cliente', valor: (l) => l.clienteNome, render: (l) => l.clienteNome || <span className="crm-mudo">—</span> },
                  { id: 'valor', titulo: 'Valor', alinhar: 'dir', valor: (l) => (Number.isFinite(l.valor) ? l.valor : 0), render: (l) => (Number.isFinite(l.valor) ? D.fmtBRL(l.valor) : l.bruto.valor) },
                  { id: 'tipo', titulo: 'Entendi como', semOrdem: true, render: (l) => (!l.escopo ? '' : l.padrao === 'mensal' ? 'mensalidade' : l.padrao === 'lote' ? 'lote de ' + l.lote + ' vídeos' : l.padrao === 'dia' ? 'dia de projeto' : l.padrao === 'real_time' ? 'real time' : l.projetoNome ? 'projeto' : 'vídeo') },
                  { id: 'categoria', titulo: 'Categoria', render: (l) => l.categoriaNome || <span className="crm-mudo">—</span> },
                  {
                    id: 'situacao', titulo: 'Situação', semOrdem: true, render: (l) => {
                      if (!l.escopo) return <Tag tom="mudo">fora: {l.motivoIgnorada}</Tag>;
                      if (l.incluir) return <span><Tag tom="ok">entra</Tag>{l.avisos.length ? <small className="crm-mudo"> {l.avisos.join('; ')}</small> : null}</span>;
                      return <span><Tag tom="mal">dúvida</Tag> <small className="crm-mudo">{l.duvidas.join('; ')}</small></span>;
                    },
                  },
                  { id: 'acao', titulo: '', semOrdem: true, render: (l) => (l.escopo && l.duvidas.length ? <Botao variante="contorno" peq onClick={() => alternar(l.n)}>{l.incluir ? 'tirar' : 'incluir'}</Botao> : null) },
                ]}
              />
            </Cartao>

            <Cartao titulo="3. O que será criado">
              {plano.novos.recebiveis === 0 && plano.jaImportadas === 0 && !plano.semCliente ? <div className="crm-mudo">Nada para importar ainda.</div> : (
                <div className="crm-linha" style={{ gap: 18 }}>
                  <span>{plano.novos.recebiveis} pagamentos · {D.fmtBRL(plano.novos.soma)}</span>
                  <span>{plano.novos.trabalhos} vídeos</span>
                  <span>{plano.novos.projetos} projetos</span>
                  <span>{plano.novos.contratos} contratos mensais</span>
                  <span>{plano.novos.clientes} clientes novos</span>
                  {plano.jaImportadas > 0 && <Tag tom="info">{plano.jaImportadas} já importadas antes (puladas)</Tag>}
                  {plano.semCliente > 0 && <Tag tom="mal">{plano.semCliente} sem cliente (puladas)</Tag>}
                </div>
              )}
              <div style={{ marginTop: 12 }}><Botao onClick={importar} disabled={gravando || !plano.ops.length}>{gravando ? 'Gravando…' : 'Importar'}</Botao></div>
            </Cartao>
          </>
        )}
      </div>
    );
  }

  window.CRMTelas = window.CRMTelas || {};
  window.CRMTelas.Importar = Importar;
})();
