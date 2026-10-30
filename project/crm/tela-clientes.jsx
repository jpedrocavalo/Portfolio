/* ════════════════════════════════════════════════════════════════
   CRM: CLIENTES (lista e ficha)
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useMemo } = React;
  const D = window.CRM.dominio;
  const A = window.CRM.analise;
  const { useCRM, ir, Cartao, Kpi, Tag, Botao, Tabela, Modal, Entrada, Area, Seletor, Filtro, TagStatus } = window.CRMUI;
  const { Colunas, Rosca } = window.CRMGraf;

  const STATUS = [{ v: 'lead', r: 'Lead' }, { v: 'ativo', r: 'Ativo' }, { v: 'recorrente', r: 'Recorrente' }, { v: 'inativo', r: 'Inativo' }];
  const TIPOS = [{ v: 'pessoa', r: 'Pessoa' }, { v: 'produtora', r: 'Produtora' }];
  const INTERACOES = [{ v: 'nota', r: 'Nota' }, { v: 'whatsapp', r: 'WhatsApp' }, { v: 'ligacao', r: 'Ligação' }, { v: 'email', r: 'E-mail' }, { v: 'reuniao', r: 'Reunião' }];
  const nomeDe = (lista, v) => (lista.find((x) => x.v === v) || {}).r || v;

  const vazioCliente = { nome: '', tipo: 'pessoa', status: 'ativo', contato: '', whatsapp: '', email: '', instagram: '', cidade: '', origem: '', indicado_por: '', notas: '' };
  const texto = (v) => (v === '' || v === undefined ? null : v);

  // ─── Formulário de cliente ─────────────────────────────────────
  function FormCliente({ inicial, aoFechar }) {
    const { t, criar, atualizar, agir } = useCRM();
    const [f, setF] = useState({ ...vazioCliente, ...(inicial || {}), indicado_por: (inicial && inicial.indicado_por) || '' });
    const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
    const salvar = async () => {
      if (!f.nome.trim()) return;
      const dados = {
        nome: f.nome.trim(), tipo: f.tipo, status: f.status, contato: texto(f.contato), whatsapp: texto(f.whatsapp), email: texto(f.email),
        instagram: texto(f.instagram), cidade: texto(f.cidade), origem: texto(f.origem), indicado_por: f.indicado_por || null, notas: texto(f.notas),
      };
      const ok = await agir(async () => { if (inicial && inicial.id) await atualizar('clientes', inicial.id, dados); else await criar('clientes', dados); });
      if (ok) aoFechar();
    };
    return (
      <Modal titulo={inicial && inicial.id ? 'Editar cliente' : 'Novo cliente'} aoFechar={aoFechar}
        rodape={<><Botao variante="contorno" onClick={aoFechar}>Cancelar</Botao><Botao onClick={salvar} disabled={!f.nome.trim()}>Salvar</Botao></>}>
        <div className="crm-form">
          <Entrada rotulo="Nome" cheio valor={f.nome} onChange={set('nome')} autoFocus />
          <Seletor rotulo="Tipo" valor={f.tipo} onChange={set('tipo')} opcoes={TIPOS} />
          <Seletor rotulo="Status" valor={f.status} onChange={set('status')} opcoes={STATUS} />
          <Entrada rotulo="Contato (pessoa)" valor={f.contato} onChange={set('contato')} />
          <Entrada rotulo="WhatsApp" valor={f.whatsapp} onChange={set('whatsapp')} placeholder="84 99999-9999" />
          <Entrada rotulo="E-mail" valor={f.email} onChange={set('email')} />
          <Entrada rotulo="Instagram" valor={f.instagram} onChange={set('instagram')} />
          <Entrada rotulo="Cidade" valor={f.cidade} onChange={set('cidade')} />
          <Entrada rotulo="Como chegou" valor={f.origem} onChange={set('origem')} placeholder="indicação, Instagram…" />
          <Seletor rotulo="Indicado por" valor={f.indicado_por} onChange={set('indicado_por')} vazio="ninguém"
            opcoes={t.clientes.filter((c) => !inicial || c.id !== inicial.id).map((c) => ({ v: c.id, r: c.nome }))} />
          <Area rotulo="Notas" valor={f.notas} onChange={set('notas')} />
        </div>
      </Modal>
    );
  }

  // ─── Cobrança do cliente: por vídeo ou mensal ──────────────────
  function FormCobranca({ cliente, aoFechar }) {
    const { t, hoje, criar, atualizar, agir } = useCRM();
    const contratoAtivo = t.contratos_mensais.find((c) => c.cliente_id === cliente.id && c.ativo);
    const [modelo, setModelo] = useState(D.modeloDeCobranca(t.clientes_cobranca, cliente.id, hoje));
    const [desde, setDesde] = useState(hoje.slice(0, 8) + '01');
    const [valor, setValor] = useState(contratoAtivo ? String(contratoAtivo.valor_mensal).replace('.', ',') : '');
    const [dia, setDia] = useState(contratoAtivo ? String(contratoAtivo.dia_vencimento) : '5');
    const [inclusos, setInclusos] = useState(contratoAtivo && contratoAtivo.videos_inclusos != null ? String(contratoAtivo.videos_inclusos) : '');
    const v = D.parseBRL(valor);
    const podeSalvar = D.isoValido(desde) && (modelo === 'avulso' || (Number.isFinite(v) && v > 0));
    const salvar = async () => {
      const ok = await agir(async () => {
        await criar('clientes_cobranca', { cliente_id: cliente.id, modelo, desde });
        if (modelo === 'mensal') {
          const dados = { valor_mensal: v, dia_vencimento: Math.min(28, Math.max(1, +dia || 1)), videos_inclusos: inclusos === '' ? null : +inclusos };
          if (contratoAtivo) await atualizar('contratos_mensais', contratoAtivo.id, dados);
          else await criar('contratos_mensais', { ...dados, cliente_id: cliente.id, inicio: desde, ativo: true });
        } else if (contratoAtivo) {
          // Voltou a ser por vídeo: o contrato acaba no dia anterior; os pagamentos passados continuam valendo
          await atualizar('contratos_mensais', contratoAtivo.id, { fim: D.addDias(desde, -1), ativo: false });
        }
      });
      if (ok) aoFechar();
    };
    return (
      <Modal titulo={'Cobrança de ' + cliente.nome} aoFechar={aoFechar}
        rodape={<><Botao variante="contorno" onClick={aoFechar}>Cancelar</Botao><Botao onClick={salvar} disabled={!podeSalvar}>Salvar</Botao></>}>
        <div className="crm-form">
          <Seletor rotulo="Modelo" valor={modelo} onChange={setModelo} opcoes={[{ v: 'avulso', r: 'Por vídeo' }, { v: 'mensal', r: 'Mensal' }]} />
          <Entrada rotulo="Vale a partir de" tipo="date" valor={desde} onChange={setDesde} dica="O histórico anterior continua como era." />
          {modelo === 'mensal' && (
            <>
              <Entrada rotulo="Valor da mensalidade" valor={valor} onChange={setValor} placeholder="1.500,00" />
              <Entrada rotulo="Dia do vencimento (1 a 28)" tipo="number" valor={dia} onChange={setDia} min={1} max={28} />
              <Entrada rotulo="Vídeos inclusos por mês" tipo="number" valor={inclusos} onChange={setInclusos} min={0} dica="Opcional." />
            </>
          )}
        </div>
      </Modal>
    );
  }

  // ─── Lista ─────────────────────────────────────────────────────
  function Lista() {
    const { t, hoje } = useCRM();
    const [busca, setBusca] = useState('');
    const [status, setStatus] = useState('');
    const [tipo, setTipo] = useState('');
    const [novo, setNovo] = useState(false);

    const linhas = useMemo(() => {
      const fatias = D.atribuirReceita(t).filter((x) => x.realizado);
      const total = new Map(), videos = new Map(), aberto = new Map(), ultimo = new Map();
      fatias.forEach((x) => { if (x.cliente_id) total.set(x.cliente_id, (total.get(x.cliente_id) || 0) + D.centavos(x.valor)); });
      t.trabalhos.forEach((x) => {
        videos.set(x.cliente_id, (videos.get(x.cliente_id) || 0) + 1);
        if (x.entregue_em && (!ultimo.get(x.cliente_id) || x.entregue_em > ultimo.get(x.cliente_id))) ultimo.set(x.cliente_id, x.entregue_em);
      });
      t.recebiveis.filter((r) => r.status === 'a_receber').forEach((r) => {
        const c = r.cliente_id || (t.contratos_mensais.find((m) => m.id === r.contrato_id) || {}).cliente_id;
        if (c) aberto.set(c, (aberto.get(c) || 0) + D.centavos(r.valor));
      });
      const q = D.semAcento(busca);
      return t.clientes
        .filter((c) => (!status || c.status === status) && (!tipo || c.tipo === tipo) && (!q || D.semAcento(c.nome).includes(q)))
        .map((c) => ({
          ...c, total: D.deCentavos(total.get(c.id) || 0), videos: videos.get(c.id) || 0, aberto: D.deCentavos(aberto.get(c.id) || 0),
          ultimo: ultimo.get(c.id) || '', modelo: D.modeloDeCobranca(t.clientes_cobranca, c.id, hoje),
        }));
    }, [t, busca, status, tipo, hoje]);

    return (
      <div>
        <div className="crm-cabeca">
          <div><h1>Clientes</h1><div className="sub">{linhas.length} de {t.clientes.length}</div></div>
          <div className="crm-acoes"><Botao onClick={() => setNovo(true)}>+ Novo cliente</Botao></div>
        </div>
        <div className="crm-filtros">
          <Filtro rotulo="Buscar"><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="nome do cliente" /></Filtro>
          <Filtro rotulo="Status"><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todos</option>{STATUS.map((s) => <option key={s.v} value={s.v}>{s.r}</option>)}</select></Filtro>
          <Filtro rotulo="Tipo"><select value={tipo} onChange={(e) => setTipo(e.target.value)}><option value="">Todos</option>{TIPOS.map((s) => <option key={s.v} value={s.v}>{s.r}</option>)}</select></Filtro>
        </div>
        <Cartao semMargem>
          <Tabela
            vazio="Nenhum cliente com esses filtros."
            linhas={linhas}
            ordemInicial={{ id: 'total', dir: 'desc' }}
            aoClicar={(c) => ir('clientes/' + c.id)}
            colunas={[
              { id: 'nome', titulo: 'Cliente', render: (c) => <strong>{c.nome}</strong> },
              { id: 'tipo', titulo: 'Tipo', render: (c) => nomeDe(TIPOS, c.tipo) },
              { id: 'status', titulo: 'Status', render: (c) => <Tag tom={c.status === 'inativo' ? 'mudo' : c.status === 'recorrente' ? 'ok' : ''}>{nomeDe(STATUS, c.status)}</Tag> },
              { id: 'modelo', titulo: 'Cobrança', render: (c) => (c.modelo === 'mensal' ? <Tag tom="info">Mensal</Tag> : <span className="crm-mudo">Por vídeo</span>) },
              { id: 'videos', titulo: 'Vídeos', alinhar: 'dir' },
              { id: 'total', titulo: 'Recebido', alinhar: 'dir', render: (c) => D.fmtBRL(c.total) },
              { id: 'aberto', titulo: 'Em aberto', alinhar: 'dir', render: (c) => (c.aberto ? D.fmtBRL(c.aberto) : <span className="crm-mudo">—</span>) },
              { id: 'ultimo', titulo: 'Última entrega', render: (c) => (c.ultimo ? D.fmtData(c.ultimo) : <span className="crm-mudo">—</span>) },
            ]}
          />
        </Cartao>
        {novo && <FormCliente aoFechar={() => setNovo(false)} />}
      </div>
    );
  }

  // ─── Ficha ─────────────────────────────────────────────────────
  function Ficha({ id }) {
    const { t, hoje, criar, atualizar, apagar, agir } = useCRM();
    const cliente = t.clientes.find((c) => c.id === id);
    const [editando, setEditando] = useState(false);
    const [cobrando, setCobrando] = useState(false);
    const [tipoNota, setTipoNota] = useState('nota');
    const [textoNota, setTextoNota] = useState('');

    const d = useMemo(() => {
      if (!cliente) return null;
      const fatias = D.atribuirReceita(t).filter((x) => x.cliente_id === id);
      const caixa = A.filtrar(fatias, { base: 'caixa' });
      const mes = D.mesDe(hoje);
      const de = D.mesDe(D.addMeses(mes + '-01', -11));
      const trabalhos = t.trabalhos.filter((x) => x.cliente_id === id);
      const contratos = t.contratos_mensais.filter((c) => c.cliente_id === id).map((c) => c.id);
      const recs = t.recebiveis.filter((r) => r.cliente_id === id || contratos.includes(r.contrato_id)
        || trabalhos.some((x) => x.id === r.trabalho_id)).sort((a, b) => b.vencimento.localeCompare(a.vencimento));
      const total = A.soma(caixa);
      const entregues = trabalhos.filter((x) => x.entregue_em).length;
      return {
        trabalhos, recs, total, entregues,
        aberto: D.somar(recs.filter((r) => r.status === 'a_receber'), (r) => r.valor),
        meses: A.porMes(A.filtrar(caixa, { base: 'caixa', de: de + '-01' }), trabalhos, de, mes, { cliente_id: id }),
        categorias: A.agrupar(caixa, 'categoria', t),
        contrato: t.contratos_mensais.find((c) => c.cliente_id === id && c.ativo),
        modelo: D.modeloDeCobranca(t.clientes_cobranca, id, hoje),
        notas: t.interacoes.filter((x) => x.cliente_id === id).sort((a, b) => b.em.localeCompare(a.em)),
      };
    }, [t, id, hoje, cliente]);

    if (!cliente) return <div><Botao variante="texto" onClick={() => ir('clientes')}>← Clientes</Botao><div className="crm-vazio">Cliente não encontrado.</div></div>;

    const zap = (cliente.whatsapp || '').replace(/\D/g, '');
    const projetoNome = (pid) => (t.projetos.find((p) => p.id === pid) || {}).nome || '';
    const apagarCliente = async () => {
      if (d.recs.length) { alert('Este cliente tem pagamentos. Apague ou mude os pagamentos antes de apagar o cliente.'); return; }
      if (!confirm('Apagar "' + cliente.nome + '" e os ' + d.trabalhos.length + ' trabalhos dele? Não dá para desfazer.')) return;
      const ok = await agir(() => apagar('clientes', id, { nome: cliente.nome }));
      if (ok) ir('clientes');
    };
    const anotar = async () => {
      if (!textoNota.trim()) return;
      const ok = await agir(() => criar('interacoes', { cliente_id: id, tipo: tipoNota, texto: textoNota.trim(), em: new Date().toISOString() }));
      if (ok) setTextoNota('');
    };

    return (
      <div>
        <Botao variante="texto" onClick={() => ir('clientes')}>← Clientes</Botao>
        <div className="crm-cabeca" style={{ marginTop: 6 }}>
          <div>
            <h1>{cliente.nome}</h1>
            <div className="sub crm-linha" style={{ gap: 6 }}>
              <Tag>{nomeDe(TIPOS, cliente.tipo)}</Tag><Tag tom={cliente.status === 'inativo' ? 'mudo' : 'ok'}>{nomeDe(STATUS, cliente.status)}</Tag>
              {d.modelo === 'mensal' ? <Tag tom="info">Mensal{d.contrato ? ' · ' + D.fmtBRL(d.contrato.valor_mensal) : ''}</Tag> : <Tag tom="mudo">Por vídeo</Tag>}
              {[cliente.contato, cliente.cidade, cliente.origem].filter(Boolean).join(' · ')}
            </div>
          </div>
          <div className="crm-acoes">
            {zap && <a className="crm-btn contorno" href={'https://wa.me/55' + zap} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            <Botao variante="contorno" onClick={() => setCobrando(true)}>Cobrança</Botao>
            <Botao variante="contorno" onClick={() => setEditando(true)}>Editar</Botao>
            <Botao variante="perigo" onClick={apagarCliente}>Apagar</Botao>
          </div>
        </div>

        <div className="crm-grade c3" style={{ marginBottom: 14 }}>
          <Kpi rotulo="Recebido (total)" valor={D.fmtBRL(d.total)} sub={d.entregues + ' vídeos entregues'} />
          <Kpi rotulo="Em aberto" valor={D.fmtBRL(d.aberto)} />
          <Kpi rotulo="Média por vídeo" valor={d.entregues ? D.fmtBRL(d.total / d.entregues) : '—'} />
        </div>

        <div className="crm-grade c2">
          <Cartao titulo="Receita por mês (12 meses)"><Colunas dados={d.meses.map((m) => ({ rotulo: D.fmtMes(m.mes).slice(0, 3), valor: m.valor, linha: m.videos }))} nomeLinha="vídeos entregues" altura={200} /></Cartao>
          <Cartao titulo="Por categoria de vídeo"><Rosca dados={d.categorias.map((c) => ({ rotulo: c.rotulo, valor: c.valor }))} /></Cartao>
        </div>

        <Cartao titulo={'Trabalhos (' + d.trabalhos.length + ')'} semMargem>
          <Tabela
            vazio="Nenhum trabalho ainda."
            linhas={d.trabalhos}
            ordemInicial={{ id: 'data', dir: 'desc' }}
            aoClicar={() => ir('trabalhos')}
            colunas={[
              { id: 'data', titulo: 'Entrega', valor: (x) => x.entregue_em || x.prazo || '', render: (x) => (x.entregue_em ? D.fmtData(x.entregue_em) : <span className="crm-mudo">prazo {x.prazo ? D.fmtData(x.prazo) : '—'}</span>) },
              { id: 'titulo', titulo: 'Vídeo' },
              { id: 'projeto', titulo: 'Projeto', valor: (x) => projetoNome(x.projeto_id), render: (x) => projetoNome(x.projeto_id) || <span className="crm-mudo">—</span> },
              { id: 'categoria', titulo: 'Categoria', valor: (x) => (t.categorias_video.find((c) => c.id === x.categoria_id) || {}).nome || '', render: (x) => (t.categorias_video.find((c) => c.id === x.categoria_id) || {}).nome || '' },
              { id: 'etapa', titulo: 'Etapa', render: (x) => <Tag>{(D.ETAPAS.find((e) => e.id === x.etapa) || {}).nome}</Tag> },
              { id: 'valor', titulo: 'Valor', alinhar: 'dir', render: (x) => (x.valor ? D.fmtBRL(x.valor) : <span className="crm-mudo">mensal/projeto</span>), valor: (x) => +x.valor || 0 },
            ]}
          />
        </Cartao>

        <Cartao titulo={'Pagamentos (' + d.recs.length + ')'} semMargem>
          <Tabela
            vazio="Nenhum pagamento."
            linhas={d.recs}
            aoClicar={() => ir('financeiro')}
            colunas={[
              { id: 'vencimento', titulo: 'Vencimento', render: (r) => D.fmtData(r.vencimento) },
              { id: 'descricao', titulo: 'Descrição', render: (r) => r.descricao || <span className="crm-mudo">—</span> },
              { id: 'valor', titulo: 'Valor', alinhar: 'dir', render: (r) => D.fmtBRL(r.valor), valor: (r) => +r.valor },
              { id: 'status', titulo: 'Situação', semOrdem: true, render: (r) => <TagStatus rec={r} hoje={hoje} /> },
            ]}
          />
        </Cartao>

        <Cartao titulo="Histórico e notas">
          <div className="crm-linha" style={{ marginBottom: 10, alignItems: 'flex-end' }}>
            <div style={{ width: 130 }}><Seletor rotulo="Tipo" valor={tipoNota} onChange={setTipoNota} opcoes={INTERACOES} /></div>
            <div style={{ flex: 1, minWidth: 200 }}><Entrada rotulo="O que aconteceu" valor={textoNota} onChange={setTextoNota} onKeyDown={(e) => { if (e.key === 'Enter') anotar(); }} /></div>
            <Botao onClick={anotar} disabled={!textoNota.trim()}>Anotar</Botao>
          </div>
          {d.notas.length ? (
            <ul className="crm-lista-simples" style={{ margin: '0 -12px -12px' }}>
              {d.notas.map((n) => (
                <li key={n.id}>
                  <Tag>{nomeDe(INTERACOES, n.tipo)}</Tag>
                  <span className="gr">{n.texto}<small>{D.fmtData(n.em.slice(0, 10))}</small></span>
                  <Botao variante="texto" peq onClick={() => { if (confirm('Apagar esta nota?')) agir(() => apagar('interacoes', n.id)); }}>apagar</Botao>
                </li>
              ))}
            </ul>
          ) : <div className="crm-mudo">Sem anotações.</div>}
          {cliente.notas && <div className="crm-pre" style={{ marginTop: 10 }}>{cliente.notas}</div>}
        </Cartao>

        {editando && <FormCliente inicial={cliente} aoFechar={() => setEditando(false)} />}
        {cobrando && <FormCobranca cliente={cliente} aoFechar={() => setCobrando(false)} />}
      </div>
    );
  }

  function Clientes({ rota }) { return rota[1] ? <Ficha id={rota[1]} /> : <Lista />; }

  window.CRMTelas = window.CRMTelas || {};
  window.CRMTelas.Clientes = Clientes;
  window.CRMTelas.FormCliente = FormCliente;
})();
