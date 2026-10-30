/* ════════════════════════════════════════════════════════════════
   CRM: TRABALHOS (os vídeos): quadro por etapa e lista
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useMemo } = React;
  const D = window.CRM.dominio;
  const { useCRM, useIndices, Cartao, Tag, Botao, Tabela, Modal, Entrada, Area, Seletor, Caixa, Filtro, Abas } = window.CRMUI;

  const nulo = (v) => (v === '' || v == null ? null : v);
  const num = (v) => (v === '' || v == null ? null : Number(v));

  // ─── Formulário ────────────────────────────────────────────────
  function FormTrabalho({ inicial, aoFechar }) {
    const { t, hoje, criar, atualizar, apagar, agir } = useCRM();
    const editando = inicial && inicial.id;
    const [f, setF] = useState(() => ({
      cliente_id: '', projeto_id: '', servico_id: '', categoria_id: '', titulo: '', etapa: 'recebido',
      recebido_em: hoje, prazo: '', entregue_em: '', rodadas: 0, valor: '', horas: '',
      drive: '', checkit: '', notas_tecnicas: '', entra_no_portfolio: false, novoProjeto: '',
      ...(inicial || {}),
      valor: inicial && inicial.valor != null ? String(inicial.valor).replace('.', ',') : '',
      horas: inicial && inicial.horas != null ? String(inicial.horas) : '',
      drive: (inicial && inicial.links && inicial.links.drive) || '',
      checkit: (inicial && inicial.links && inicial.links.checkit) || '',
      projeto_id: (inicial && inicial.projeto_id) || '', servico_id: (inicial && inicial.servico_id) || '', categoria_id: (inicial && inicial.categoria_id) || '',
      recebido_em: (inicial && inicial.recebido_em) || (editando ? '' : hoje), prazo: (inicial && inicial.prazo) || '', entregue_em: (inicial && inicial.entregue_em) || '',
      notas_tecnicas: (inicial && inicial.notas_tecnicas) || '',
    }));
    const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
    const projetosDoCliente = t.projetos.filter((p) => p.cliente_id === f.cliente_id);
    const valor = f.valor === '' ? null : D.parseBRL(f.valor);
    const valido = f.cliente_id && f.titulo.trim() && (valor === null || Number.isFinite(valor));

    const salvar = async () => {
      const ok = await agir(async () => {
        let projeto = nulo(f.projeto_id);
        if (projeto === '__novo') {
          if (!f.novoProjeto.trim()) throw new Error('Dê um nome ao novo projeto.');
          projeto = (await criar('projetos', { cliente_id: f.cliente_id, nome: f.novoProjeto.trim(), ano: D.anoDe(hoje) })).id;
        }
        const links = { ...((inicial && inicial.links) || {}) };
        ['drive', 'checkit'].forEach((k) => { if (f[k]) links[k] = f[k]; else delete links[k]; });
        const dados = {
          cliente_id: f.cliente_id, projeto_id: projeto, servico_id: nulo(f.servico_id), categoria_id: nulo(f.categoria_id),
          titulo: f.titulo.trim(), etapa: f.etapa, recebido_em: nulo(f.recebido_em), prazo: nulo(f.prazo), entregue_em: nulo(f.entregue_em),
          rodadas: num(f.rodadas) || 0, valor, horas: num(f.horas), links, notas_tecnicas: nulo(f.notas_tecnicas), entra_no_portfolio: !!f.entra_no_portfolio,
        };
        if (editando) await atualizar('trabalhos', inicial.id, dados); else await criar('trabalhos', dados);
      });
      if (ok) aoFechar();
    };
    const excluir = async () => {
      if (!confirm('Apagar "' + inicial.titulo + '"? Não dá para desfazer.')) return;
      const ok = await agir(() => apagar('trabalhos', inicial.id, { titulo: inicial.titulo }));
      if (ok) aoFechar();
    };

    return (
      <Modal larga titulo={editando ? 'Editar trabalho' : 'Novo trabalho'} aoFechar={aoFechar}
        rodape={<>
          {editando && <Botao variante="perigo" onClick={excluir} style={{ marginRight: 'auto' }}>Apagar</Botao>}
          <Botao variante="contorno" onClick={aoFechar}>Cancelar</Botao><Botao onClick={salvar} disabled={!valido}>Salvar</Botao>
        </>}>
        <div className="crm-form">
          <Seletor rotulo="Cliente" valor={f.cliente_id} onChange={(v) => setF((p) => ({ ...p, cliente_id: v, projeto_id: '' }))} vazio="escolha…" opcoes={t.clientes.map((c) => ({ v: c.id, r: c.nome }))} />
          <Seletor rotulo="Projeto (agrupa vários vídeos)" valor={f.projeto_id} onChange={set('projeto_id')} vazio="nenhum"
            opcoes={[...projetosDoCliente.map((p) => ({ v: p.id, r: p.nome })), { v: '__novo', r: '+ novo projeto…' }]} />
          {f.projeto_id === '__novo' && <Entrada rotulo="Nome do novo projeto" cheio valor={f.novoProjeto} onChange={set('novoProjeto')} />}
          <Entrada rotulo="Título do vídeo" cheio valor={f.titulo} onChange={set('titulo')} autoFocus />
          <Seletor rotulo="Serviço" valor={f.servico_id} onChange={set('servico_id')} vazio="nenhum" opcoes={t.servicos.filter((s) => s.ativo).map((s) => ({ v: s.id, r: s.nome }))} />
          <Seletor rotulo="Categoria de vídeo" valor={f.categoria_id} onChange={set('categoria_id')} vazio="nenhuma" opcoes={t.categorias_video.filter((c) => c.ativo).sort((a, b) => a.ordem - b.ordem).map((c) => ({ v: c.id, r: c.nome }))} />
          <Seletor rotulo="Etapa" valor={f.etapa} onChange={set('etapa')} opcoes={D.ETAPAS.map((e) => ({ v: e.id, r: e.nome }))} />
          <Entrada rotulo="Rodadas de revisão" tipo="number" min={0} valor={f.rodadas} onChange={set('rodadas')} />
          <Entrada rotulo="Recebido em" tipo="date" valor={f.recebido_em} onChange={set('recebido_em')} />
          <Entrada rotulo="Prazo" tipo="date" valor={f.prazo} onChange={set('prazo')} />
          <Entrada rotulo="Entregue em" tipo="date" valor={f.entregue_em} onChange={set('entregue_em')} />
          <Entrada rotulo="Valor deste vídeo" valor={f.valor} onChange={set('valor')} placeholder="450,00" dica="Deixe vazio se o cliente paga mensal ou o projeto inteiro." />
          <Entrada rotulo="Horas gastas" tipo="number" min={0} step="0.5" valor={f.horas} onChange={set('horas')} />
          <Entrada rotulo="Link do Drive" valor={f.drive} onChange={set('drive')} />
          <Entrada rotulo="Link do Checkit" valor={f.checkit} onChange={set('checkit')} />
          <Area rotulo="Notas técnicas (codec, versão, observações)" valor={f.notas_tecnicas} onChange={set('notas_tecnicas')} />
          <Caixa rotulo="Entra no portfólio" valor={f.entra_no_portfolio} onChange={set('entra_no_portfolio')} />
        </div>
      </Modal>
    );
  }

  // ─── Tela ──────────────────────────────────────────────────────
  function Trabalhos() {
    const { t, hoje, atualizar, agir } = useCRM();
    const ix = useIndices(t);
    const [vista, setVista] = useState('quadro');
    const [busca, setBusca] = useState('');
    const [cliente, setCliente] = useState('');
    const [categoria, setCategoria] = useState('');
    const [mostrarFim, setMostrarFim] = useState(false);
    const [form, setForm] = useState(null); // null | {} (novo) | trabalho

    const lista = useMemo(() => {
      const q = D.semAcento(busca);
      return t.trabalhos.filter((x) => (!cliente || x.cliente_id === cliente) && (!categoria || x.categoria_id === categoria)
        && (!q || D.semAcento(x.titulo).includes(q)));
    }, [t.trabalhos, busca, cliente, categoria]);

    const mover = (x, dir) => {
      const i = D.ETAPAS.findIndex((e) => e.id === x.etapa);
      const nova = D.ETAPAS[i + dir];
      if (!nova) return;
      const mud = { etapa: nova.id };
      if (['entregue', 'pago'].includes(nova.id) && !x.entregue_em) mud.entregue_em = hoje;
      agir(() => atualizar('trabalhos', x.id, mud));
    };
    const cat = (x) => nomeCat(ix, x);
    const nomeCat = (ix2, x) => (ix2.categoria.get(x.categoria_id) || {}).nome || '';

    const colunasQuadro = D.ETAPAS.filter((e) => mostrarFim || !['pago'].includes(e.id));

    return (
      <div>
        <div className="crm-cabeca">
          <div><h1>Trabalhos</h1><div className="sub">{lista.filter((x) => !['entregue', 'pago'].includes(x.etapa)).length} em andamento · {lista.length} no total</div></div>
          <div className="crm-acoes"><Botao onClick={() => setForm({})}>+ Novo trabalho</Botao></div>
        </div>
        <Abas abas={[{ id: 'quadro', nome: 'Quadro' }, { id: 'lista', nome: 'Lista' }]} ativa={vista} aoMudar={setVista} />
        <div className="crm-filtros">
          <Filtro rotulo="Buscar"><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="título do vídeo" /></Filtro>
          <Filtro rotulo="Cliente"><select value={cliente} onChange={(e) => setCliente(e.target.value)}><option value="">Todos</option>{t.clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></Filtro>
          <Filtro rotulo="Categoria"><select value={categoria} onChange={(e) => setCategoria(e.target.value)}><option value="">Todas</option>{t.categorias_video.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></Filtro>
          {vista === 'quadro' && <Caixa rotulo="mostrar coluna Pago" valor={mostrarFim} onChange={setMostrarFim} />}
        </div>

        {vista === 'quadro' ? (
          <div className="crm-quadro" style={{ gridTemplateColumns: 'repeat(' + colunasQuadro.length + ', minmax(180px, 1fr))' }}>
            {colunasQuadro.map((e) => {
              const cards = lista.filter((x) => x.etapa === e.id).sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'));
              const cardsVisiveis = e.id === 'entregue' ? cards.slice(0, 12) : cards;
              return (
                <div key={e.id} className="crm-col">
                  <header><span>{e.nome}</span><span>{cards.length}</span></header>
                  <div className="cards">
                    {cardsVisiveis.map((x) => {
                      const atrasado = x.prazo && x.prazo < hoje && !['entregue', 'pago'].includes(x.etapa);
                      return (
                        <div key={x.id} className="crm-card">
                          <div className="t" onClick={() => setForm(x)}>{x.titulo}</div>
                          <div className="m">{(ix.cliente.get(x.cliente_id) || {}).nome}{cat(x) ? ' · ' + cat(x) : ''}</div>
                          <div className="m">{x.prazo && !['entregue', 'pago'].includes(x.etapa) ? <span className={atrasado ? 'atraso' : ''}>prazo {D.fmtData(x.prazo)}</span> : x.entregue_em ? 'entregue ' + D.fmtData(x.entregue_em) : ''}{x.valor ? ' · ' + D.fmtBRL(x.valor) : ''}</div>
                          <div className="pe">
                            <Botao variante="texto" peq onClick={() => mover(x, -1)} disabled={e.id === 'recebido'} aria-label="Etapa anterior">◀</Botao>
                            {x.rodadas > 0 && <span className="crm-pequeno crm-mudo">{x.rodadas} rod.</span>}
                            <Botao variante="texto" peq onClick={() => mover(x, 1)} disabled={e.id === 'pago'} aria-label="Próxima etapa">▶</Botao>
                          </div>
                        </div>
                      );
                    })}
                    {e.id === 'entregue' && cards.length > 12 && <div className="crm-pequeno crm-mudo" style={{ padding: 4 }}>+ {cards.length - 12} na Lista</div>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Cartao semMargem>
            <Tabela
              vazio="Nenhum trabalho com esses filtros."
              linhas={lista}
              ordemInicial={{ id: 'data', dir: 'desc' }}
              aoClicar={(x) => setForm(x)}
              colunas={[
                { id: 'data', titulo: 'Entrega / prazo', valor: (x) => x.entregue_em || x.prazo || '', render: (x) => (x.entregue_em ? D.fmtData(x.entregue_em) : x.prazo ? <span className="crm-mudo">{D.fmtData(x.prazo)}</span> : '—') },
                { id: 'titulo', titulo: 'Vídeo', render: (x) => <strong>{x.titulo}</strong> },
                { id: 'cliente', titulo: 'Cliente', valor: (x) => (ix.cliente.get(x.cliente_id) || {}).nome || '', render: (x) => (ix.cliente.get(x.cliente_id) || {}).nome },
                { id: 'projeto', titulo: 'Projeto', valor: (x) => (ix.projeto.get(x.projeto_id) || {}).nome || '', render: (x) => (ix.projeto.get(x.projeto_id) || {}).nome || <span className="crm-mudo">—</span> },
                { id: 'categoria', titulo: 'Categoria', valor: cat, render: cat },
                { id: 'etapa', titulo: 'Etapa', valor: (x) => D.ETAPAS.findIndex((e) => e.id === x.etapa), render: (x) => <Tag>{(D.ETAPAS.find((e) => e.id === x.etapa) || {}).nome}</Tag> },
                { id: 'valor', titulo: 'Valor', alinhar: 'dir', valor: (x) => +x.valor || 0, render: (x) => (x.valor ? D.fmtBRL(x.valor) : <span className="crm-mudo">—</span>) },
              ]}
            />
          </Cartao>
        )}
        {form && <FormTrabalho inicial={form.id ? form : null} aoFechar={() => setForm(null)} />}
      </div>
    );
  }

  window.CRMTelas = window.CRMTelas || {};
  window.CRMTelas.Trabalhos = Trabalhos;
})();
