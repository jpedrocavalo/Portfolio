/* ════════════════════════════════════════════════════════════════
   CRM: TAREFAS
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState } = React;
  const D = window.CRM.dominio;
  const { useCRM, Cartao, Tag, Botao, Entrada, Seletor } = window.CRMUI;

  function Tarefas() {
    const { t, hoje, criar, atualizar, apagar, agir } = useCRM();
    const [titulo, setTitulo] = useState('');
    const [para, setPara] = useState(hoje);
    const [cliente, setCliente] = useState('');
    const [verFeitas, setVerFeitas] = useState(false);

    const nomeCliente = (id) => (t.clientes.find((c) => c.id === id) || {}).nome || '';
    const abertas = t.tarefas.filter((x) => !x.feita);
    const grupos = [
      { nome: 'Atrasadas', tom: 'mal', itens: abertas.filter((x) => x.para && x.para < hoje) },
      { nome: 'Hoje', itens: abertas.filter((x) => x.para === hoje) },
      { nome: 'Próximas', itens: abertas.filter((x) => x.para && x.para > hoje) },
      { nome: 'Sem data', itens: abertas.filter((x) => !x.para) },
    ].map((g) => ({ ...g, itens: g.itens.sort((a, b) => (a.para || '').localeCompare(b.para || '')) }));
    const feitas = t.tarefas.filter((x) => x.feita).sort((a, b) => (b.atualizado_em || '').localeCompare(a.atualizado_em || '')).slice(0, 15);

    const adicionar = async () => {
      if (!titulo.trim()) return;
      const ok = await agir(() => criar('tarefas', { titulo: titulo.trim(), para: para || null, cliente_id: cliente || null }));
      if (ok) setTitulo('');
    };
    const alternar = (x) => agir(() => atualizar('tarefas', x.id, { feita: !x.feita }));

    const Linha = ({ x }) => (
      <li>
        <input type="checkbox" checked={x.feita} onChange={() => alternar(x)} aria-label="Feita" />
        <span className="gr" style={x.feita ? { textDecoration: 'line-through', color: 'var(--muted)' } : null}>
          {x.titulo}{x.cliente_id ? <small>{nomeCliente(x.cliente_id)}</small> : null}
        </span>
        {x.para && <Tag tom={!x.feita && x.para < hoje ? 'mal' : ''}>{D.fmtData(x.para)}</Tag>}
        <Botao variante="texto" peq onClick={() => agir(() => apagar('tarefas', x.id))}>apagar</Botao>
      </li>
    );

    return (
      <div>
        <div className="crm-cabeca"><div><h1>Tarefas</h1><div className="sub">{abertas.length} abertas</div></div></div>
        <Cartao>
          <div className="crm-linha" style={{ alignItems: 'flex-end' }}>
            <div style={{ flex: 1, minWidth: 220 }}><Entrada rotulo="Nova tarefa" valor={titulo} onChange={setTitulo} onKeyDown={(e) => { if (e.key === 'Enter') adicionar(); }} placeholder="o que precisa ser feito" /></div>
            <div style={{ width: 150 }}><Entrada rotulo="Para" tipo="date" valor={para} onChange={setPara} /></div>
            <div style={{ width: 200 }}><Seletor rotulo="Cliente (opcional)" valor={cliente} onChange={setCliente} vazio="nenhum" opcoes={t.clientes.map((c) => ({ v: c.id, r: c.nome }))} /></div>
            <Botao onClick={adicionar} disabled={!titulo.trim()}>Adicionar</Botao>
          </div>
        </Cartao>
        {grupos.filter((g) => g.itens.length).map((g) => (
          <Cartao key={g.nome} titulo={g.nome + ' (' + g.itens.length + ')'} semMargem>
            <ul className="crm-lista-simples">{g.itens.map((x) => <Linha key={x.id} x={x} />)}</ul>
          </Cartao>
        ))}
        {!abertas.length && <div className="crm-vazio">Nada pendente.</div>}
        {feitas.length > 0 && (
          <Cartao titulo={'Feitas (' + feitas.length + ')'} acoes={<Botao variante="texto" peq onClick={() => setVerFeitas(!verFeitas)}>{verFeitas ? 'esconder' : 'mostrar'}</Botao>} semMargem>
            {verFeitas && <ul className="crm-lista-simples">{feitas.map((x) => <Linha key={x.id} x={x} />)}</ul>}
          </Cartao>
        )}
      </div>
    );
  }

  window.CRMTelas = window.CRMTelas || {};
  window.CRMTelas.Tarefas = Tarefas;
})();
