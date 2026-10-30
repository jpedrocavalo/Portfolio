/* ════════════════════════════════════════════════════════════════
   CRM: GRÁFICOS (SVG e HTML puros, sem biblioteca)
   --------------------------------------------------------------
   Barras horizontais (ranking), colunas com linha opcional (séries
   por mês/ano) e rosca. Paleta sem roxo. Passar o mouse mostra o
   valor (atributo title). Exportado em window.CRMGraf.
   ════════════════════════════════════════════════════════════════ */
(function () {
  const { useMemo } = React;
  const D = window.CRM.dominio;

  const PALETA = ['#111111', '#c58f2a', '#2f5d6b', '#5c6b3a', '#b5532f', '#c9b79c', '#7c7c77', '#8a6d3b', '#4f7f8c', '#9aa66a'];
  const cor = (i) => PALETA[i % PALETA.length];

  function compacto(n) {
    const a = Math.abs(n);
    if (a >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',') + ' mi';
    if (a >= 1000) return (n / 1000).toFixed(a % 1000 ? 1 : 0).replace('.', ',') + ' mil';
    return String(Math.round(n));
  }

  // Maior valor "redondo" acima de `max`, para o eixo
  function tetoBonito(max) {
    if (max <= 0) return 1;
    const pot = Math.pow(10, Math.floor(Math.log10(max)));
    for (const m of [1, 2, 2.5, 5, 10]) if (m * pot >= max) return m * pot;
    return 10 * pot;
  }

  function Vazio({ texto }) { return <div className="crm-legenda-vazia">{texto || 'Sem dados neste filtro.'}</div>; }

  // dados: [{ rotulo, valor, sub? }] já ordenados. fmt formata o valor.
  function BarrasH({ dados, fmt, max }) {
    const f = fmt || D.fmtBRL;
    const teto = max || Math.max(0, ...dados.map((d) => d.valor));
    if (!dados.length || teto <= 0) return <Vazio />;
    return (
      <div className="crm-barras-h">
        {dados.map((d, i) => (
          <div key={d.rotulo + i} style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 34%) 1fr auto', gap: 8, alignItems: 'center', padding: '3px 0' }} title={d.rotulo + ': ' + f(d.valor)}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.rotulo}</span>
            <span style={{ background: 'var(--surf2)', height: 12 }}><i style={{ display: 'block', height: '100%', width: Math.max(2, (d.valor / teto) * 100) + '%', background: d.cor || cor(0) }} /></span>
            <span style={{ minWidth: 70, textAlign: 'right' }}>{f(d.valor)}{d.sub ? <small className="crm-mudo"> {d.sub}</small> : null}</span>
          </div>
        ))}
      </div>
    );
  }

  // dados: [{ rotulo, valor, linha? }]; `linha` (opcional) é uma segunda série
  function Colunas({ dados, fmt, nomeLinha, fmtLinha, altura }) {
    const f = fmt || D.fmtBRL;
    const fl = fmtLinha || ((n) => String(n));
    const W = 640, H = altura || 240, e = 46, d = 8, b = 26, c = 10;
    const g = useMemo(() => {
      const teto = tetoBonito(Math.max(0, ...dados.map((x) => x.valor)));
      const tetoL = tetoBonito(Math.max(0, ...dados.map((x) => x.linha || 0)));
      return { teto, tetoL };
    }, [dados]);
    if (!dados.length) return <Vazio />;
    const largura = (W - e - d) / dados.length;
    const alt = H - b - c;
    const y = (v) => c + alt - (v / g.teto) * alt;
    const yl = (v) => c + alt - (v / g.tetoL) * alt;
    const passo = Math.ceil(dados.length / 14);
    const temLinha = dados.some((x) => x.linha != null);
    const pontos = dados.map((x, i) => (e + largura * (i + 0.5)) + ',' + yl(x.linha || 0)).join(' ');
    return (
      <div>
        <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" role="img" style={{ display: 'block' }}>
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <g key={p}>
              <line x1={e} x2={W - d} y1={c + alt - alt * p} y2={c + alt - alt * p} stroke="rgba(17,17,17,0.10)" />
              <text x={e - 6} y={c + alt - alt * p + 3} textAnchor="end" fontSize="10" fill="#7c7c77">{compacto(g.teto * p)}</text>
            </g>
          ))}
          {dados.map((x, i) => (
            <g key={x.rotulo + i}>
              <rect x={e + largura * i + largura * 0.15} y={y(x.valor)} width={largura * 0.7} height={Math.max(0, c + alt - y(x.valor))} fill="#111">
                <title>{x.rotulo + ': ' + f(x.valor) + (x.linha != null ? ' · ' + fl(x.linha) + ' ' + (nomeLinha || '') : '')}</title>
              </rect>
              {i % passo === 0 && <text x={e + largura * (i + 0.5)} y={H - 8} textAnchor="middle" fontSize="10" fill="#7c7c77">{x.rotulo}</text>}
            </g>
          ))}
          {temLinha && (
            <g>
              <polyline points={pontos} fill="none" stroke="#c58f2a" strokeWidth="1.6" />
              {dados.map((x, i) => <circle key={i} cx={e + largura * (i + 0.5)} cy={yl(x.linha || 0)} r="2.6" fill="#c58f2a"><title>{x.rotulo + ': ' + fl(x.linha || 0) + ' ' + (nomeLinha || '')}</title></circle>)}
            </g>
          )}
        </svg>
        {temLinha && (
          <div className="crm-linha crm-pequeno crm-mudo" style={{ gap: 14, marginTop: 4 }}>
            <span><i style={{ display: 'inline-block', width: 10, height: 10, background: '#111', marginRight: 5 }} />receita</span>
            <span><i style={{ display: 'inline-block', width: 10, height: 2, background: '#c58f2a', marginRight: 5, verticalAlign: 'middle' }} />{nomeLinha}</span>
          </div>
        )}
      </div>
    );
  }

  // dados: [{ rotulo, valor }]; as fatias menores viram "Outros" depois de `maxFatias`
  function Rosca({ dados, fmt, maxFatias }) {
    const f = fmt || D.fmtBRL;
    const lista = useMemo(() => {
      const ord = [...dados].filter((x) => x.valor > 0).sort((a, b) => b.valor - a.valor);
      const lim = maxFatias || 7;
      if (ord.length <= lim) return ord;
      const resto = ord.slice(lim - 1).reduce((s, x) => s + x.valor, 0);
      return [...ord.slice(0, lim - 1), { rotulo: 'Outros', valor: resto }];
    }, [dados, maxFatias]);
    const total = lista.reduce((s, x) => s + x.valor, 0);
    if (!total) return <Vazio />;
    const R = 52, C = 2 * Math.PI * R;
    let acc = 0;
    return (
      <div className="crm-linha" style={{ gap: 18, alignItems: 'center' }}>
        <svg viewBox="0 0 140 140" width="150" height="150" role="img" style={{ flex: '0 0 auto' }}>
          <g transform="rotate(-90 70 70)">
            {lista.map((x, i) => {
              const len = (x.valor / total) * C;
              const el = (
                <circle key={x.rotulo} cx="70" cy="70" r={R} fill="none" stroke={cor(i)} strokeWidth="22"
                  strokeDasharray={len + ' ' + (C - len)} strokeDashoffset={-acc}>
                  <title>{x.rotulo + ': ' + f(x.valor) + ' (' + Math.round((x.valor / total) * 100) + '%)'}</title>
                </circle>
              );
              acc += len;
              return el;
            })}
          </g>
        </svg>
        <ul className="crm-lista-simples" style={{ flex: 1, minWidth: 150 }}>
          {lista.map((x, i) => (
            <li key={x.rotulo} style={{ padding: '3px 0', border: 0 }}>
              <i style={{ width: 10, height: 10, background: cor(i), flex: '0 0 10px' }} />
              <span className="gr" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.rotulo}</span>
              <span>{Math.round((x.valor / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  window.CRMGraf = { BarrasH, Colunas, Rosca, compacto, PALETA };
})();
