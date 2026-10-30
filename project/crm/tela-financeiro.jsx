/* ════════════════════════════════════════════════════════════════
   CRM: FINANCEIRO (pagamentos, mensalidades, despesas)
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useMemo } = React;
  const D = window.CRM.dominio;
  const { useCRM, useIndices, Cartao, Kpi, Tag, Botao, Tabela, Modal, Entrada, Area, Seletor, Caixa, Filtro, Abas, TagStatus, Aviso, preencherModelo } = window.CRMUI;

  const FORMAS = [{ v: 'pix', r: 'Pix' }, { v: 'transferencia', r: 'Transferência' }, { v: 'dinheiro', r: 'Dinheiro' }, { v: 'cartao', r: 'Cartão' }, { v: 'outro', r: 'Outro' }];
  const CATEGORIAS_DESPESA = [{ v: 'software', r: 'Software' }, { v: 'equipamento', r: 'Equipamento' }, { v: 'armazenamento', r: 'Armazenamento' }, { v: 'imposto', r: 'Imposto' }, { v: 'outros', r: 'Outros' }];
  const nulo = (v) => (v === '' || v == null ? null : v);

  // ─── Formulário de pagamento ───────────────────────────────────
  function FormRecebivel({ inicial, aoFechar }) {
    const { t, hoje, criar, atualizar, apagar, agir } = useCRM();
    const editando = inicial && inicial.id;
    const liga0 = !inicial ? 'cliente' : inicial.trabalho_id ? 'trabalho' : inicial.projeto_id ? 'projeto' : inicial.contrato_id ? 'contrato' : 'cliente';
    const [f, setF] = useState({
      cliente_id: (inicial && inicial.cliente_id) || '', liga: liga0,
      alvo: (inicial && (inicial.trabalho_id || inicial.projeto_id || inicial.contrato_id)) || '',
      descricao: (inicial && inicial.descricao) || '',
      valor: inicial ? String(inicial.valor).replace('.', ',') : '',
      vencimento: (inicial && inicial.vencimento) || hoje,
      status: (inicial && inicial.status) || 'a_receber',
      pago_em: (inicial && inicial.pago_em) || '', forma: (inicial && inicial.forma) || '',
      parcela: (inicial && inicial.parcela) || '', parcelas: (inicial && inicial.parcelas) || '',
    });
    const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
    const valor = D.parseBRL(f.valor);
    const alvos = {
      trabalho: t.trabalhos.filter((x) => x.cliente_id === f.cliente_id).map((x) => ({ v: x.id, r: x.titulo })),
      projeto: t.projetos.filter((x) => x.cliente_id === f.cliente_id).map((x) => ({ v: x.id, r: x.nome })),
      contrato: t.contratos_mensais.filter((x) => x.cliente_id === f.cliente_id).map((x) => ({ v: x.id, r: 'Mensal ' + D.fmtBRL(x.valor_mensal) + (x.ativo ? '' : ' (encerrado)') })),
    };
    const valido = f.cliente_id && Number.isFinite(valor) && valor >= 0 && D.isoValido(f.vencimento)
      && (f.status !== 'pago' || D.isoValido(f.pago_em)) && (f.liga === 'cliente' || f.alvo);

    const salvar = async () => {
      const dados = {
        cliente_id: f.cliente_id, trabalho_id: f.liga === 'trabalho' ? f.alvo : null, projeto_id: f.liga === 'projeto' ? f.alvo : null,
        contrato_id: f.liga === 'contrato' ? f.alvo : null, descricao: nulo(f.descricao), valor, vencimento: f.vencimento,
        status: f.status, pago_em: f.status === 'pago' ? f.pago_em : null, forma: nulo(f.forma),
        parcela: f.parcela === '' ? null : +f.parcela, parcelas: f.parcelas === '' ? null : +f.parcelas,
      };
      const ok = await agir(async () => { if (editando) await atualizar('recebiveis', inicial.id, dados); else await criar('recebiveis', dados); });
      if (ok) aoFechar();
    };
    const excluir = async () => {
      if (!confirm('Apagar este pagamento? Não dá para desfazer.')) return;
      const ok = await agir(() => apagar('recebiveis', inicial.id, { descricao: inicial.descricao, valor: inicial.valor }));
      if (ok) aoFechar();
    };

    return (
      <Modal titulo={editando ? 'Editar pagamento' : 'Novo pagamento'} aoFechar={aoFechar}
        rodape={<>
          {editando && <Botao variante="perigo" onClick={excluir} style={{ marginRight: 'auto' }}>Apagar</Botao>}
          <Botao variante="contorno" onClick={aoFechar}>Cancelar</Botao><Botao onClick={salvar} disabled={!valido}>Salvar</Botao>
        </>}>
        <div className="crm-form">
          <Seletor rotulo="Cliente" cheio valor={f.cliente_id} onChange={(v) => setF((p) => ({ ...p, cliente_id: v, alvo: '' }))} vazio="escolha…" opcoes={t.clientes.map((c) => ({ v: c.id, r: c.nome }))} />
          <Seletor rotulo="Referente a" valor={f.liga} onChange={(v) => setF((p) => ({ ...p, liga: v, alvo: '' }))}
            opcoes={[{ v: 'cliente', r: 'Só o cliente' }, { v: 'trabalho', r: 'Um vídeo' }, { v: 'projeto', r: 'Um projeto inteiro' }, { v: 'contrato', r: 'Mensalidade' }]} />
          {f.liga !== 'cliente'
            ? <Seletor rotulo={f.liga === 'trabalho' ? 'Vídeo' : f.liga === 'projeto' ? 'Projeto' : 'Contrato'} valor={f.alvo} onChange={set('alvo')} vazio="escolha…" opcoes={alvos[f.liga]} dica={!alvos[f.liga].length ? 'Este cliente não tem nenhum.' : null} />
            : <div />}
          <Entrada rotulo="Descrição" cheio valor={f.descricao} onChange={set('descricao')} />
          <Entrada rotulo="Valor" valor={f.valor} onChange={set('valor')} placeholder="450,00" />
          <Entrada rotulo="Vencimento" tipo="date" valor={f.vencimento} onChange={set('vencimento')} />
          <Seletor rotulo="Situação" valor={f.status} onChange={(v) => setF((p) => ({ ...p, status: v, pago_em: v === 'pago' && !p.pago_em ? hoje : p.pago_em }))} opcoes={[{ v: 'a_receber', r: 'A receber' }, { v: 'pago', r: 'Pago' }, { v: 'cancelado', r: 'Cancelado' }]} />
          {f.status === 'pago' && <Entrada rotulo="Pago em" tipo="date" valor={f.pago_em} onChange={set('pago_em')} />}
          <Seletor rotulo="Forma" valor={f.forma} onChange={set('forma')} vazio="—" opcoes={FORMAS} />
          <Entrada rotulo="Parcela" tipo="number" min={1} valor={f.parcela} onChange={set('parcela')} dica="Ex.: 1" />
          <Entrada rotulo="de quantas" tipo="number" min={1} valor={f.parcelas} onChange={set('parcelas')} dica="Ex.: 2" />
        </div>
      </Modal>
    );
  }

  // ─── Mensagem de cobrança (texto de WhatsApp) ───────────────────
  function Cobrar({ rec, aoFechar }) {
    const { t } = useCRM();
    const cliente = t.clientes.find((c) => c.id === rec.cliente_id) || {};
    const [modeloId, setModeloId] = useState((t.modelos_mensagem[0] || {}).id || '');
    const modelo = t.modelos_mensagem.find((m) => m.id === modeloId);
    const [msg, setMsg] = useState(() => preencherModelo(modelo && modelo.texto, { cliente: cliente.nome || '', valor: D.fmtBRL(rec.valor), prazo: D.fmtData(rec.vencimento) }));
    const trocar = (id) => {
      setModeloId(id);
      const m = t.modelos_mensagem.find((x) => x.id === id);
      setMsg(preencherModelo(m && m.texto, { cliente: cliente.nome || '', valor: D.fmtBRL(rec.valor), prazo: D.fmtData(rec.vencimento) }));
    };
    const zap = (cliente.whatsapp || '').replace(/\D/g, '');
    return (
      <Modal titulo={'Cobrar ' + (cliente.nome || '')} aoFechar={aoFechar}
        rodape={<>
          <Botao variante="contorno" onClick={() => { if (navigator.clipboard) navigator.clipboard.writeText(msg); }}>Copiar texto</Botao>
          {zap ? <a className="crm-btn" href={'https://wa.me/55' + zap + '?text=' + encodeURIComponent(msg)} target="_blank" rel="noopener noreferrer">Abrir no WhatsApp</a> : <Tag tom="mudo">cliente sem WhatsApp</Tag>}
        </>}>
        <div className="crm-form">
          <Seletor rotulo="Modelo" cheio valor={modeloId} onChange={trocar} vazio="sem modelo" opcoes={t.modelos_mensagem.map((m) => ({ v: m.id, r: m.nome }))} />
          <Area rotulo="Mensagem" valor={msg} onChange={setMsg} rows={5} />
        </div>
      </Modal>
    );
  }

  // ─── Formulário de despesa ─────────────────────────────────────
  function FormDespesa({ inicial, aoFechar }) {
    const { hoje, criar, atualizar, apagar, agir } = useCRM();
    const editando = inicial && inicial.id;
    const [f, setF] = useState({
      descricao: (inicial && inicial.descricao) || '', valor: inicial ? String(inicial.valor).replace('.', ',') : '',
      data: (inicial && inicial.data) || hoje, categoria: (inicial && inicial.categoria) || 'outros', recorrente: !!(inicial && inicial.recorrente),
    });
    const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));
    const valor = D.parseBRL(f.valor);
    const salvar = async () => {
      const dados = { descricao: f.descricao.trim(), valor, data: f.data, categoria: f.categoria, recorrente: f.recorrente };
      const ok = await agir(async () => { if (editando) await atualizar('despesas', inicial.id, dados); else await criar('despesas', dados); });
      if (ok) aoFechar();
    };
    const excluir = async () => {
      if (!confirm('Apagar esta despesa?')) return;
      const ok = await agir(() => apagar('despesas', inicial.id, { descricao: inicial.descricao }));
      if (ok) aoFechar();
    };
    return (
      <Modal titulo={editando ? 'Editar despesa' : 'Nova despesa'} aoFechar={aoFechar}
        rodape={<>
          {editando && <Botao variante="perigo" onClick={excluir} style={{ marginRight: 'auto' }}>Apagar</Botao>}
          <Botao variante="contorno" onClick={aoFechar}>Cancelar</Botao>
          <Botao onClick={salvar} disabled={!f.descricao.trim() || !Number.isFinite(valor) || !D.isoValido(f.data)}>Salvar</Botao>
        </>}>
        <div className="crm-form">
          <Entrada rotulo="Descrição" cheio valor={f.descricao} onChange={set('descricao')} autoFocus />
          <Entrada rotulo="Valor" valor={f.valor} onChange={set('valor')} placeholder="129,00" />
          <Entrada rotulo="Data" tipo="date" valor={f.data} onChange={set('data')} />
          <Seletor rotulo="Categoria" valor={f.categoria} onChange={set('categoria')} opcoes={CATEGORIAS_DESPESA} />
          <Caixa rotulo="Recorrente (todo mês)" valor={f.recorrente} onChange={set('recorrente')} />
        </div>
      </Modal>
    );
  }

  // ─── Tela ──────────────────────────────────────────────────────
  function Financeiro() {
    const { t, hoje, atualizar, criar, agir } = useCRM();
    const ix = useIndices(t);
    const [aba, setAba] = useState('pagamentos');
    const [status, setStatus] = useState('');
    const [cliente, setCliente] = useState('');
    const [mes, setMes] = useState('');
    const [form, setForm] = useState(null);
    const [cobrar, setCobrar] = useState(null);
    const [formDesp, setFormDesp] = useState(null);

    const mesAtual = D.mesDe(hoje);
    const resumo = useMemo(() => D.resumoDoMes(t, mesAtual, hoje), [t, mesAtual, hoje]);
    const despesasMes = D.somar(t.despesas.filter((d) => D.mesDe(d.data) === mesAtual), (d) => d.valor);

    const clienteDe = (r) => r.cliente_id || (ix.contrato.get(r.contrato_id) || {}).cliente_id;
    const linhas = useMemo(() => t.recebiveis
      .map((r) => ({ ...r, situacao: D.statusEfetivo(r, hoje), clienteFinal: clienteDe(r) }))
      .filter((r) => (!status || r.situacao === status) && (!cliente || r.clienteFinal === cliente) && (!mes || D.mesDe(r.status === 'pago' ? r.pago_em : r.vencimento) === mes)),
    [t.recebiveis, status, cliente, mes, hoje]);
    const somaLista = D.somar(linhas.filter((r) => r.situacao !== 'cancelado'), (r) => r.valor);

    // Mensalidades que ainda não foram criadas, até o mês que vem
    const faltam = useMemo(() => t.contratos_mensais.flatMap((c) => D.gerarMensalidades(c, t.recebiveis, D.addMeses(hoje, 1))), [t, hoje]);
    const gerar = () => agir(async () => { for (const m of faltam) await criar('recebiveis', m); });

    const pagarHoje = (r) => agir(() => atualizar('recebiveis', r.id, { status: 'pago', pago_em: hoje, forma: r.forma || 'pix' }));
    const meses = [...new Set(t.recebiveis.map((r) => D.mesDe(r.status === 'pago' ? r.pago_em : r.vencimento)))].sort().reverse();

    return (
      <div>
        <div className="crm-cabeca">
          <div><h1>Financeiro</h1><div className="sub">{D.fmtMes(mesAtual)}</div></div>
          <div className="crm-acoes">
            {aba === 'pagamentos' ? <Botao onClick={() => setForm({})}>+ Novo pagamento</Botao> : <Botao onClick={() => setFormDesp({})}>+ Nova despesa</Botao>}
          </div>
        </div>

        <div className="crm-grade c3" style={{ marginBottom: 14 }}>
          <Kpi rotulo="Recebido no mês" valor={D.fmtBRL(resumo.recebido)} sub={'Despesas ' + D.fmtBRL(despesasMes) + ' · sobra ' + D.fmtBRL(resumo.recebido - despesasMes)} />
          <Kpi rotulo="Atrasado" valor={D.fmtBRL(resumo.atrasado)} sub={resumo.qtdAtrasados + ' pagamento(s)'} tom={resumo.atrasado > 0 ? 'mal' : ''} />
          <Kpi rotulo="A receber em 30 dias" valor={D.fmtBRL(resumo.aReceber30d)} />
        </div>

        {faltam.length > 0 && (
          <Aviso>
            <div className="crm-linha crm-sp"><span>{faltam.length} mensalidade(s) ainda não foram criadas (até o mês que vem).</span><Botao peq onClick={gerar}>Gerar mensalidades</Botao></div>
          </Aviso>
        )}

        <Abas abas={[{ id: 'pagamentos', nome: 'Pagamentos' }, { id: 'despesas', nome: 'Despesas' }]} ativa={aba} aoMudar={setAba} />

        {aba === 'pagamentos' ? (
          <>
            <div className="crm-filtros">
              <Filtro rotulo="Situação"><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Todas</option><option value="atrasado">Atrasado</option><option value="a_receber">A receber</option><option value="pago">Pago</option><option value="cancelado">Cancelado</option></select></Filtro>
              <Filtro rotulo="Cliente"><select value={cliente} onChange={(e) => setCliente(e.target.value)}><option value="">Todos</option>{t.clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></Filtro>
              <Filtro rotulo="Mês"><select value={mes} onChange={(e) => setMes(e.target.value)}><option value="">Todos</option>{meses.map((m) => <option key={m} value={m}>{D.fmtMes(m)}</option>)}</select></Filtro>
              <div className="crm-mudo" style={{ marginLeft: 'auto' }}>{linhas.length} pagamentos · {D.fmtBRL(somaLista)}</div>
            </div>
            <Cartao semMargem>
              <Tabela
                vazio="Nenhum pagamento com esses filtros."
                linhas={linhas}
                ordemInicial={{ id: 'data', dir: 'desc' }}
                aoClicar={(r) => setForm(r)}
                colunas={[
                  { id: 'data', titulo: 'Data', valor: (r) => (r.status === 'pago' ? r.pago_em : r.vencimento), render: (r) => (r.status === 'pago' ? D.fmtData(r.pago_em) : <span className="crm-mudo">vence {D.fmtData(r.vencimento)}</span>) },
                  { id: 'cliente', titulo: 'Cliente', valor: (r) => (ix.cliente.get(r.clienteFinal) || {}).nome || '', render: (r) => (ix.cliente.get(r.clienteFinal) || {}).nome || <span className="crm-mudo">—</span> },
                  { id: 'descricao', titulo: 'Descrição', render: (r) => r.descricao || <span className="crm-mudo">—</span> },
                  { id: 'valor', titulo: 'Valor', alinhar: 'dir', valor: (r) => +r.valor, render: (r) => D.fmtBRL(r.valor) },
                  { id: 'situacao', titulo: 'Situação', render: (r) => <TagStatus rec={r} hoje={hoje} /> },
                  {
                    id: 'acoes', titulo: '', semOrdem: true, alinhar: 'dir', render: (r) => (r.status === 'a_receber' ? (
                      <span className="crm-linha" style={{ justifyContent: 'flex-end', gap: 4 }} onClick={(e) => e.stopPropagation()}>
                        <Botao variante="contorno" peq onClick={() => setCobrar(r)}>Cobrar</Botao>
                        <Botao peq onClick={() => pagarHoje(r)}>Pago hoje</Botao>
                      </span>
                    ) : null),
                  },
                ]}
              />
            </Cartao>
          </>
        ) : (
          <Cartao semMargem>
            <Tabela
              vazio="Nenhuma despesa."
              linhas={t.despesas}
              ordemInicial={{ id: 'data', dir: 'desc' }}
              aoClicar={(d) => setFormDesp(d)}
              colunas={[
                { id: 'data', titulo: 'Data', render: (d) => D.fmtData(d.data) },
                { id: 'descricao', titulo: 'Descrição' },
                { id: 'categoria', titulo: 'Categoria', render: (d) => (CATEGORIAS_DESPESA.find((c) => c.v === d.categoria) || {}).r },
                { id: 'recorrente', titulo: '', render: (d) => (d.recorrente ? <Tag>mensal</Tag> : null), semOrdem: true },
                { id: 'valor', titulo: 'Valor', alinhar: 'dir', valor: (d) => +d.valor, render: (d) => D.fmtBRL(d.valor) },
              ]}
            />
          </Cartao>
        )}
        {form && <FormRecebivel inicial={form.id ? form : null} aoFechar={() => setForm(null)} />}
        {cobrar && <Cobrar rec={cobrar} aoFechar={() => setCobrar(null)} />}
        {formDesp && <FormDespesa inicial={formDesp.id ? formDesp : null} aoFechar={() => setFormDesp(null)} />}
      </div>
    );
  }

  window.CRMTelas = window.CRMTelas || {};
  window.CRMTelas.Financeiro = Financeiro;
})();
