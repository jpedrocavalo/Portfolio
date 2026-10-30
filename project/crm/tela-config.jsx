/* ════════════════════════════════════════════════════════════════
   CRM: CONFIGURAÇÕES
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState } = React;
  const D = window.CRM.dominio;
  const { useCRM, Cartao, Tag, Botao, Tabela, Modal, Entrada, Area, Seletor, Caixa, Abas, Aviso } = window.CRMUI;

  const LINHAS = [{ v: 'edicao', r: 'Edição' }, { v: 'color', r: 'Color' }, { v: 'sites', r: 'Sites' }, { v: 'outro', r: 'Outro' }];
  const UNIDADES = [{ v: 'video', r: 'por vídeo' }, { v: 'projeto', r: 'por projeto' }, { v: 'diaria', r: 'por diária' }, { v: 'hora', r: 'por hora' }, { v: 'mensal', r: 'mensal' }];
  const nome = (lista, v) => (lista.find((x) => x.v === v) || {}).r || v;

  // Grava um valor em `config`: atualiza se a chave existe, senão cria
  function useGravarConfig() {
    const { t, criar, atualizar } = useCRM();
    return (chave, valor) => {
      const atual = t.config.find((c) => c.chave === chave);
      return atual ? atualizar('config', atual.id, { valor }) : criar('config', { chave, valor });
    };
  }
  const cfg = (t, chave, padrao) => { const c = t.config.find((x) => x.chave === chave); return c ? c.valor : padrao; };

  // ─── Estúdio e limites ─────────────────────────────────────────
  function Estudio() {
    const { t, hoje, agir, criar, atualizar } = useCRM();
    const gravar = useGravarConfig();
    const e0 = cfg(t, 'estudio', {}) || {};
    const [e, setE] = useState({ nome: e0.nome || '', whatsapp: e0.whatsapp || '', instagram: e0.instagram || '', site: e0.site || '' });
    const [mei, setMei] = useState(String(cfg(t, 'mei_limite', 81000)));
    const ano = hoje.slice(0, 4), mes = hoje.slice(0, 7);
    const meta = (periodo) => t.metas.find((m) => m.periodo === periodo && m.tipo === 'receita');
    const [metaAno, setMetaAno] = useState(meta(ano) ? String(meta(ano).valor) : '');
    const [metaMes, setMetaMes] = useState(meta(mes) ? String(meta(mes).valor) : '');
    const [salvo, setSalvo] = useState(false);

    const salvarMeta = async (periodo, texto) => {
      const v = D.parseBRL(texto), atual = meta(periodo);
      if (!Number.isFinite(v)) return;
      if (atual) await atualizar('metas', atual.id, { valor: v }); else await criar('metas', { periodo, tipo: 'receita', valor: v });
    };
    const salvar = async () => {
      const limite = D.parseBRL(mei);
      const ok = await agir(async () => {
        await gravar('estudio', e);
        if (Number.isFinite(limite)) await gravar('mei_limite', limite);
        if (metaAno) await salvarMeta(ano, metaAno);
        if (metaMes) await salvarMeta(mes, metaMes);
      });
      setSalvo(ok);
    };

    return (
      <Cartao titulo="Estúdio, limite do MEI e metas">
        <div className="crm-form">
          <Entrada rotulo="Nome do estúdio (aparece na proposta)" valor={e.nome} onChange={(v) => setE({ ...e, nome: v })} />
          <Entrada rotulo="WhatsApp" valor={e.whatsapp} onChange={(v) => setE({ ...e, whatsapp: v })} />
          <Entrada rotulo="Instagram" valor={e.instagram} onChange={(v) => setE({ ...e, instagram: v })} />
          <Entrada rotulo="Site" valor={e.site} onChange={(v) => setE({ ...e, site: v })} />
          <Entrada rotulo="Limite anual do MEI (R$)" valor={mei} onChange={setMei} dica="Confira o valor vigente no Portal do Empreendedor." />
          <div />
          <Entrada rotulo={'Meta de receita de ' + ano} valor={metaAno} onChange={setMetaAno} placeholder="60.000,00" />
          <Entrada rotulo={'Meta de receita de ' + D.fmtMes(mes)} valor={metaMes} onChange={setMetaMes} placeholder="5.500,00" />
        </div>
        <div className="crm-linha" style={{ marginTop: 12 }}><Botao onClick={salvar}>Salvar</Botao>{salvo && <span className="crm-mudo">salvo</span>}</div>
      </Cartao>
    );
  }

  // ─── Categorias de vídeo ───────────────────────────────────────
  function Categorias() {
    const { t, criar, atualizar, apagar, agir } = useCRM();
    const [novo, setNovo] = useState('');
    const usados = (id) => t.trabalhos.filter((x) => x.categoria_id === id).length;
    const adicionar = async () => {
      const n = novo.trim();
      if (!n) return;
      if (t.categorias_video.some((c) => D.semAcento(c.nome) === D.semAcento(n))) { alert('Essa categoria já existe.'); return; }
      const ok = await agir(() => criar('categorias_video', { nome: n, ordem: t.categorias_video.length + 1 }));
      if (ok) setNovo('');
    };
    return (
      <Cartao titulo="Categorias de vídeo" semMargem>
        <div className="crm-linha" style={{ padding: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}><Entrada rotulo="Nova categoria" valor={novo} onChange={setNovo} onKeyDown={(e) => { if (e.key === 'Enter') adicionar(); }} /></div>
          <Botao onClick={adicionar} disabled={!novo.trim()}>Adicionar</Botao>
        </div>
        <Tabela
          linhas={[...t.categorias_video].sort((a, b) => a.ordem - b.ordem)}
          colunas={[
            { id: 'nome', titulo: 'Nome', semOrdem: true, render: (c) => <span style={c.ativo ? null : { color: 'var(--muted)' }}>{c.nome}</span> },
            { id: 'uso', titulo: 'Vídeos', semOrdem: true, alinhar: 'dir', render: (c) => usados(c.id) },
            {
              id: 'acoes', titulo: '', semOrdem: true, alinhar: 'dir', render: (c) => (
                <span className="crm-linha" style={{ justifyContent: 'flex-end', gap: 4 }}>
                  <Botao variante="contorno" peq onClick={() => { const n = prompt('Novo nome', c.nome); if (n && n.trim()) agir(() => atualizar('categorias_video', c.id, { nome: n.trim() })); }}>renomear</Botao>
                  <Botao variante="contorno" peq onClick={() => agir(() => atualizar('categorias_video', c.id, { ativo: !c.ativo }))}>{c.ativo ? 'desativar' : 'ativar'}</Botao>
                  <Botao variante="perigo" peq onClick={() => { if (confirm('Apagar "' + c.nome + '"? Os ' + usados(c.id) + ' vídeos ficam sem categoria.')) agir(() => apagar('categorias_video', c.id, { nome: c.nome })); }}>apagar</Botao>
                </span>
              ),
            },
          ]}
        />
      </Cartao>
    );
  }

  // ─── Serviços (preços) ─────────────────────────────────────────
  function FormServico({ inicial, aoFechar }) {
    const { criar, atualizar, apagar, agir } = useCRM();
    const editando = inicial && inicial.id;
    const [f, setF] = useState({
      nome: (inicial && inicial.nome) || '', linha: (inicial && inicial.linha) || 'edicao', unidade: (inicial && inicial.unidade) || 'video',
      preco: inicial ? String(inicial.preco).replace('.', ',') : '', prazo_dias: inicial && inicial.prazo_dias != null ? String(inicial.prazo_dias) : '',
      descricao: (inicial && inicial.descricao) || '', ativo: inicial ? inicial.ativo : true,
    });
    const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
    const preco = D.parseBRL(f.preco);
    const salvar = async () => {
      const dados = { nome: f.nome.trim(), linha: f.linha, unidade: f.unidade, preco, prazo_dias: f.prazo_dias === '' ? null : +f.prazo_dias, descricao: f.descricao || null, ativo: f.ativo };
      const ok = await agir(async () => { if (editando) await atualizar('servicos', inicial.id, dados); else await criar('servicos', dados); });
      if (ok) aoFechar();
    };
    return (
      <Modal titulo={editando ? 'Editar serviço' : 'Novo serviço'} aoFechar={aoFechar}
        rodape={<>
          {editando && <Botao variante="perigo" style={{ marginRight: 'auto' }} onClick={async () => { if (confirm('Apagar este serviço?')) { const ok = await agir(() => apagar('servicos', inicial.id, { nome: inicial.nome })); if (ok) aoFechar(); } }}>Apagar</Botao>}
          <Botao variante="contorno" onClick={aoFechar}>Cancelar</Botao><Botao onClick={salvar} disabled={!f.nome.trim() || !Number.isFinite(preco)}>Salvar</Botao>
        </>}>
        <div className="crm-form">
          <Entrada rotulo="Nome" cheio valor={f.nome} onChange={set('nome')} autoFocus />
          <Seletor rotulo="Linha" valor={f.linha} onChange={set('linha')} opcoes={LINHAS} />
          <Seletor rotulo="Cobrado" valor={f.unidade} onChange={set('unidade')} opcoes={UNIDADES} />
          <Entrada rotulo="Preço (R$)" valor={f.preco} onChange={set('preco')} placeholder="450,00" />
          <Entrada rotulo="Prazo padrão (dias)" tipo="number" min={0} valor={f.prazo_dias} onChange={set('prazo_dias')} />
          <Area rotulo="Descrição" valor={f.descricao} onChange={set('descricao')} />
          <Caixa rotulo="Ativo" valor={f.ativo} onChange={set('ativo')} />
        </div>
      </Modal>
    );
  }

  function Servicos() {
    const { t } = useCRM();
    const [form, setForm] = useState(null);
    return (
      <Cartao titulo="Serviços e preços" acoes={<Botao peq onClick={() => setForm({})}>+ Novo serviço</Botao>} semMargem>
        <Tabela
          vazio="Nenhum serviço."
          linhas={t.servicos}
          aoClicar={(s) => setForm(s)}
          colunas={[
            { id: 'nome', titulo: 'Serviço', render: (s) => <span style={s.ativo ? null : { color: 'var(--muted)' }}>{s.nome}</span> },
            { id: 'linha', titulo: 'Linha', render: (s) => nome(LINHAS, s.linha) },
            { id: 'unidade', titulo: 'Cobrado', render: (s) => nome(UNIDADES, s.unidade) },
            { id: 'preco', titulo: 'Preço', alinhar: 'dir', valor: (s) => +s.preco, render: (s) => D.fmtBRL(s.preco) },
            { id: 'prazo_dias', titulo: 'Prazo', alinhar: 'dir', render: (s) => (s.prazo_dias != null ? s.prazo_dias + ' dias' : '—') },
          ]}
        />
        {form && <FormServico inicial={form.id ? form : null} aoFechar={() => setForm(null)} />}
      </Cartao>
    );
  }

  // ─── Modelos de mensagem ───────────────────────────────────────
  function Mensagens() {
    const { t, criar, atualizar, apagar, agir } = useCRM();
    const [form, setForm] = useState(null);
    const [nomeM, setNomeM] = useState(''); const [textoM, setTextoM] = useState('');
    const abrir = (m) => { setForm(m || {}); setNomeM((m && m.nome) || ''); setTextoM((m && m.texto) || ''); };
    const salvar = async () => {
      const ok = await agir(async () => { if (form.id) await atualizar('modelos_mensagem', form.id, { nome: nomeM.trim(), texto: textoM }); else await criar('modelos_mensagem', { nome: nomeM.trim(), texto: textoM }); });
      if (ok) setForm(null);
    };
    return (
      <Cartao titulo="Modelos de mensagem (WhatsApp)" acoes={<Botao peq onClick={() => abrir()}>+ Novo modelo</Botao>} semMargem>
        <Tabela vazio="Nenhum modelo." linhas={t.modelos_mensagem} aoClicar={abrir}
          colunas={[{ id: 'nome', titulo: 'Nome' }, { id: 'texto', titulo: 'Texto', render: (m) => <span className="crm-mudo">{m.texto.slice(0, 90)}{m.texto.length > 90 ? '…' : ''}</span> }]} />
        {form && (
          <Modal titulo={form.id ? 'Editar modelo' : 'Novo modelo'} aoFechar={() => setForm(null)}
            rodape={<>
              {form.id && <Botao variante="perigo" style={{ marginRight: 'auto' }} onClick={async () => { if (confirm('Apagar este modelo?')) { const ok = await agir(() => apagar('modelos_mensagem', form.id, { nome: form.nome })); if (ok) setForm(null); } }}>Apagar</Botao>}
              <Botao variante="contorno" onClick={() => setForm(null)}>Cancelar</Botao><Botao onClick={salvar} disabled={!nomeM.trim() || !textoM.trim()}>Salvar</Botao>
            </>}>
            <div className="crm-form">
              <Entrada rotulo="Nome" cheio valor={nomeM} onChange={setNomeM} autoFocus />
              <Area rotulo="Texto" valor={textoM} onChange={setTextoM} rows={5} dica="Use {cliente}, {valor} e {prazo}." />
            </div>
          </Modal>
        )}
      </Cartao>
    );
  }

  // ─── Registro de ações ─────────────────────────────────────────
  function Registro() {
    const { t } = useCRM();
    const linhas = [...t.auditoria].sort((a, b) => b.em.localeCompare(a.em)).slice(0, 50);
    return (
      <Cartao titulo="Registro de ações (as 50 últimas)" semMargem>
        <Tabela vazio="Nada registrado ainda." linhas={linhas}
          colunas={[
            { id: 'em', titulo: 'Quando', render: (a) => D.fmtData(a.em.slice(0, 10)) + ' ' + a.em.slice(11, 16) },
            { id: 'acao', titulo: 'Ação' },
            { id: 'tabela', titulo: 'Tabela', render: (a) => a.tabela || '—' },
            { id: 'detalhe', titulo: 'Detalhe', semOrdem: true, render: (a) => <span className="crm-mudo">{JSON.stringify(a.detalhe || {})}</span> },
          ]} />
      </Cartao>
    );
  }

  function Config() {
    const { modo } = useCRM();
    const [aba, setAba] = useState('estudio');
    return (
      <div>
        <div className="crm-cabeca"><div><h1>Configurações</h1><div className="sub">{modo === 'demo' ? 'Modo demonstração: nada é salvo.' : 'Conectado ao banco.'}</div></div></div>
        <Abas ativa={aba} aoMudar={setAba} abas={[{ id: 'estudio', nome: 'Estúdio e metas' }, { id: 'catalogo', nome: 'Categorias e serviços' }, { id: 'mensagens', nome: 'Mensagens' }, { id: 'registro', nome: 'Registro' }]} />
        {aba === 'estudio' && <Estudio />}
        {aba === 'catalogo' && <><Categorias /><Servicos /></>}
        {aba === 'mensagens' && <Mensagens />}
        {aba === 'registro' && <Registro />}
      </div>
    );
  }

  window.CRMTelas = window.CRMTelas || {};
  window.CRMTelas.Config = Config;
})();
