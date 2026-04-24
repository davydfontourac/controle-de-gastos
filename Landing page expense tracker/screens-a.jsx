// screens-a.jsx — All Direction A screens (Dashboard, Transactions, Categories, Savings, Profile, Login)
// Uses Shell from shell-a.jsx. Each screen takes {tweaks} so they reflect current accent/density/theme.

const { useState: useStateS } = React;

// ─── Shared data ────────────────────────────────────────────────────────────
const KPIS = [
  { label: 'Disponível', sublabel: 'Saldo em conta', value: 'R$ 2.014,70', delta: '+4.2%' },
  { label: 'Caixinhas', sublabel: 'Investimentos/Reserva', value: 'R$ 13,96', delta: '+0.3%' },
  { label: 'Receitas', sublabel: 'Neste mês', value: 'R$ 3.179,00', delta: '+12%' },
  { label: 'Despesas', sublabel: 'Neste mês', value: 'R$ 1.292,83', delta: '-3.1%' },
];
const CATEGORIES = [
  { name: 'Débito', pct: 38, color: '#6366f1', emoji: '💳', total: 491.34, count: 12 },
  { name: 'Pix', pct: 30, color: '#8b5cf6', emoji: '⚡', total: 388.1, count: 8 },
  { name: 'Alimentação', pct: 16, color: '#22d3ee', emoji: '🍔', total: 207.05, count: 14 },
  { name: 'Transporte', pct: 8, color: '#0ea5e9', emoji: '🚗', total: 103.52, count: 6 },
  { name: 'Supermercado', pct: 4, color: '#f59e0b', emoji: '🛒', total: 51.76, count: 3 },
  { name: 'Saúde', pct: 2, color: '#10b981', emoji: '💊', total: 25.88, count: 2 },
  { name: 'Lazer', pct: 1, color: '#ef4444', emoji: '🎬', total: 12.94, count: 1 },
  { name: 'Educação', pct: 1, color: '#a855f7', emoji: '📚', total: 12.94, count: 1 },
];
const MONTHLY = [
  { m: 'Jan', inc: 3100, exp: 1420 },
  { m: 'Fev', inc: 3250, exp: 1890 },
  { m: 'Mar', inc: 2980, exp: 2100 },
  { m: 'Abr', inc: 3179, exp: 1293 },
  { m: 'Mai', inc: 3400, exp: 1650 },
  { m: 'Jun', inc: 3380, exp: 1480 },
  { m: 'Jul', inc: 3200, exp: 1720 },
  { m: 'Ago', inc: 3500, exp: 1580 },
  { m: 'Set', inc: 3420, exp: 1390 },
  { m: 'Out', inc: 3180, exp: 1250 },
  { m: 'Nov', inc: 3600, exp: 1700 },
  { m: 'Dez', inc: 3800, exp: 2200 },
];
const TXS = [
  {
    desc: 'Compra no débito via NuPay — iFood',
    cat: 'Alimentação',
    date: '22/04/2026',
    value: -33.39,
  },
  { desc: 'Compra no débito — CIA DAS TORTAS', cat: 'Débito', date: '22/04/2026', value: -9.6 },
  { desc: 'Transferência Pix — ZAMP S.A.', cat: 'Pix', date: '21/04/2026', value: 25.9 },
  { desc: 'Compra no débito — Uber *TRIP', cat: 'Transporte', date: '21/04/2026', value: -17.36 },
  { desc: 'Supermercado Extra — Cartão', cat: 'Supermercado', date: '20/04/2026', value: -142.8 },
  { desc: 'Farmácia Drogasil', cat: 'Saúde', date: '18/04/2026', value: -48.5 },
  { desc: 'Cinemark — Shopping Tamboré', cat: 'Lazer', date: '15/04/2026', value: -62.0 },
  { desc: 'Salário — CLT', cat: 'Receita', date: '05/04/2026', value: 3179.0 },
];
const CAT_EMOJI = {
  Alimentação: '🍔',
  Transporte: '🚗',
  Supermercado: '🛒',
  Pix: '⚡',
  Receita: '💰',
  Débito: '💳',
  Saúde: '💊',
  Lazer: '🎬',
  Educação: '📚',
};
const fmt = (n) =>
  'R$ ' +
  Math.abs(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Donut ──────────────────────────────────────────────────────────────────
function Donut({ segs, centerLabel, centerValue, size = 140, stroke = 18 }) {
  const R = (size - stroke) / 2,
    C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={R}
        fill="none"
        stroke="var(--a-divider)"
        strokeWidth={stroke}
      />
      {segs.map((s, i) => {
        const len = (s.pct / 100) * C;
        const el = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-acc}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        acc += len;
        return el;
      })}
      <text
        x={size / 2}
        y={size / 2 - 4}
        textAnchor="middle"
        fontSize="10"
        fill="var(--a-ink-400)"
        fontFamily="Geist Mono"
        letterSpacing="1"
      >
        {centerLabel}
      </text>
      <text
        x={size / 2}
        y={size / 2 + 16}
        textAnchor="middle"
        fontSize="18"
        fontWeight="600"
        fill="var(--a-ink-900)"
        fontFamily="Geist"
        letterSpacing="-0.02em"
      >
        {centerValue}
      </text>
    </svg>
  );
}

// ═══ SCREEN: DASHBOARD ══════════════════════════════════════════════════════
const DASH_STYLE = `
.A-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.A-kpi { padding: var(--a-kpi-pad, 18px 20px); border-radius: 14px; border: 1px solid var(--a-border); background: var(--a-panel); }
.A-kpi .lbl { font-family: Geist Mono, monospace; font-size: 10.5px; letter-spacing: 0.08em; color: var(--a-ink-400); text-transform: uppercase; }
.A-kpi .sublbl { font-size: 11.5px; color: var(--a-ink-500); margin-top: 2px; }
.A-kpi .val { font-size: 26px; font-weight: 600; letter-spacing: -0.025em; margin-top: 12px; line-height: 1; color: var(--a-ink-900); }
.A-kpi .dlt { font-family: Geist Mono, monospace; font-size: 11px; margin-top: 10px; }
.A-kpi .dlt.pos { color: #10b981; } .A-kpi .dlt.neg { color: #ef4444; }
.A-kpi .spark { height: 24px; width: 100%; margin-top: 10px; }

.A-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.A-bars { display: flex; align-items: flex-end; gap: 6px; height: 180px; }
.A-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.A-bar-pair { width: 100%; display: flex; gap: 2px; align-items: flex-end; height: 160px; }
.A-bar-pair .inc, .A-bar-pair .exp { flex: 1; border-radius: 3px 3px 0 0; }
.A-bar-pair .inc { background: var(--a-ink-900); }
.A-bar-pair .exp { background: var(--a-divider); }
.A-bar-col.curr .inc { background: var(--accent); }
.A-bar-col.curr .exp { background: color-mix(in oklab, var(--accent) 30%, transparent); }
.A-bar-col .lb { font-family: Geist Mono, monospace; font-size: 9.5px; color: var(--a-ink-400); letter-spacing: 0.04em; }

.A-insight { display: flex; flex-direction: column; gap: 10px; }
.A-insight .head { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--a-ink-700); }
.A-insight .head .i { width: 22px; height: 22px; border-radius: 6px; background: color-mix(in oklab, var(--accent) 15%, transparent); color: var(--accent); display: grid; place-items: center; font-size: 12px; }
.A-insight .body { font-size: 14px; line-height: 1.5; letter-spacing: -0.005em; color: var(--a-ink-900); }
.A-insight .body em { font-style: normal; color: var(--accent); font-weight: 500; }
.A-insight .goal-bar { height: 6px; border-radius: 999px; background: var(--a-divider); overflow: hidden; margin-top: 6px; }
.A-insight .goal-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); }

.A-txrow { display: grid; grid-template-columns: 32px 1fr 100px 120px; gap: 14px; align-items: center; padding: var(--a-txpad, 14px 4px); border-bottom: 1px solid var(--a-divider); }
.A-txrow:last-child { border-bottom: 0; }
.A-txrow .ic { width: 32px; height: 32px; border-radius: 8px; background: var(--a-hover); display: grid; place-items: center; font-size: 14px; }
.A-txrow .desc { font-size: 13.5px; color: var(--a-ink-900); }
.A-txrow .meta { font-size: 11px; color: var(--a-ink-400); font-family: Geist Mono, monospace; margin-top: 2px; }
.A-txrow .cat { font-size: 11.5px; color: var(--a-ink-500); font-family: Geist Mono, monospace; text-transform: uppercase; letter-spacing: 0.04em; }
.A-txrow .val { font-size: 14px; font-weight: 500; text-align: right; font-variant-numeric: tabular-nums; color: var(--a-ink-900); }
.A-txrow .val.pos { color: #10b981; }
`;

function DashboardA({ tweaks }) {
  return (
    <Shell active="dashboard" tweaks={tweaks}>
      <style>{DASH_STYLE}</style>
      <main className="A-main">
        <div className="A-top">
          <div>
            <h1>Seja bem-vindo, davyd.</h1>
            <div className="sub">
              Você gastou <b style={{ color: 'var(--a-ink-900)' }}>R$ 1.292,83</b> em abril · 41% da
              sua receita
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="A-chip">📅 Abril 2026</button>
            <button className="A-chip active">Todos</button>
            <button className="A-chip">Receitas</button>
            <button className="A-chip">Despesas</button>
            <button className="A-chip primary">+ Nova transação</button>
          </div>
        </div>

        <div className="A-kpis">
          {KPIS.map((k, i) => {
            const spark = [32, 41, 28, 52, 45, 63, 58, 72];
            const mx = Math.max(...spark);
            const color = ['var(--accent)', 'var(--accent-2)', '#10b981', '#ef4444'][i];
            return (
              <div key={k.label} className="A-kpi">
                <div className="lbl">{k.label}</div>
                <div className="sublbl">{k.sublabel}</div>
                <div className="val">{k.value}</div>
                <div className={'dlt ' + (k.delta.startsWith('-') ? 'neg' : 'pos')}>
                  {k.delta} vs. mês anterior
                </div>
                <svg className="spark" viewBox="0 0 100 24" preserveAspectRatio="none">
                  <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    points={spark
                      .map((v, j) => `${(j / (spark.length - 1)) * 100},${24 - (v / mx) * 22}`)
                      .join(' ')}
                  />
                </svg>
              </div>
            );
          })}
        </div>

        <div className="A-row">
          <div className="A-card">
            <div className="A-card-h">
              <div>
                <h3>Evolução Mensal</h3>
                <div style={{ fontSize: 12, color: 'var(--a-ink-500)', marginTop: 2 }}>
                  Receitas vs. Despesas · 12 meses
                </div>
              </div>
              <div className="meta">Jan → Dez</div>
            </div>
            <div className="A-bars">
              {MONTHLY.map((m, i) => (
                <div key={m.m} className={'A-bar-col' + (i === 3 ? ' curr' : '')}>
                  <div className="A-bar-pair">
                    <div className="inc" style={{ height: `${(m.inc / 4000) * 100}%` }} />
                    <div className="exp" style={{ height: `${(m.exp / 4000) * 100}%` }} />
                  </div>
                  <div className="lb">{m.m}</div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 18,
                marginTop: 14,
                fontSize: 12,
                color: 'var(--a-ink-500)',
              }}
            >
              <span>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    background: 'var(--a-ink-900)',
                    borderRadius: 2,
                    marginRight: 6,
                  }}
                />
                Receitas
              </span>
              <span>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    background: 'var(--a-divider)',
                    borderRadius: 2,
                    marginRight: 6,
                  }}
                />
                Despesas
              </span>
            </div>
          </div>

          <div className="A-card">
            <div className="A-card-h">
              <h3>Distribuição</h3>
              <div className="meta">R$ 1.293</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Donut segs={CATEGORIES} centerLabel="GASTO" centerValue="R$ 1.293" />
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 12.5,
                }}
              >
                {CATEGORIES.slice(0, 5).map((c) => (
                  <div
                    key={c.name}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--a-ink-700)',
                    }}
                  >
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: 2,
                          background: c.color,
                          marginRight: 8,
                        }}
                      />
                      {c.name}
                    </span>
                    <span
                      style={{ fontFamily: 'Geist Mono, monospace', color: 'var(--a-ink-500)' }}
                    >
                      {c.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="A-card A-insight">
            <div className="head">
              <span className="i">✱</span>Insights
            </div>
            <div className="body">
              Você gastou <em>R$ 187</em> a menos em <em>Alimentação</em> este mês vs. o trimestre.
              Continue assim para atingir sua meta de <em>R$ 1.200</em>.
            </div>
            <div style={{ marginTop: 4 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11.5,
                  color: 'var(--a-ink-500)',
                  fontFamily: 'Geist Mono, monospace',
                }}
              >
                <span>META MENSAL</span>
                <span>78%</span>
              </div>
              <div className="goal-bar">
                <div className="goal-fill" style={{ width: '78%' }} />
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--a-ink-400)',
                  marginTop: 6,
                  fontFamily: 'Geist Mono, monospace',
                }}
              >
                R$ 936 de R$ 1.200
              </div>
            </div>
            <div className="head" style={{ marginTop: 10 }}>
              <span className="i" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                ↗
              </span>
              Previsão
            </div>
            <div className="body" style={{ fontSize: 13.5 }}>
              No ritmo atual você fecha Abril com <em>R$ 1.450</em> em despesas.
            </div>
          </div>
        </div>

        <div className="A-card">
          <div className="A-card-h">
            <h3>Últimas Transações</h3>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="A-search" style={{ width: 220 }}>
                <span style={{ color: 'var(--a-ink-400)', fontSize: 12 }}>⌕</span>
                <input placeholder="Buscar por descrição..." />
              </div>
              <button className="A-chip">Limpar filtros</button>
            </div>
          </div>
          {TXS.slice(0, 6).map((t, i) => (
            <div key={i} className="A-txrow">
              <div className="ic">{CAT_EMOJI[t.cat] || '•'}</div>
              <div>
                <div className="desc">{t.desc}</div>
                <div className="meta">{t.date}</div>
              </div>
              <div className="cat">{t.cat}</div>
              <div className={'val ' + (t.value > 0 ? 'pos' : '')}>
                {t.value > 0 ? '+' : '−'} {fmt(t.value)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </Shell>
  );
}

// ═══ SCREEN: TRANSACTIONS ═══════════════════════════════════════════════════
const TX_STYLE = `
.A-tx-filter-row { display: flex; gap: 8px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.A-tx-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 16px; }
.A-tx-stat { padding: 14px 18px; border-radius: 12px; border: 1px solid var(--a-border); background: var(--a-panel); }
.A-tx-stat .l { font-family: Geist Mono, monospace; font-size: 10px; color: var(--a-ink-400); letter-spacing: 0.08em; text-transform: uppercase; }
.A-tx-stat .v { font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin-top: 6px; color: var(--a-ink-900); }
.A-tx-table { background: var(--a-panel); border: 1px solid var(--a-border); border-radius: 14px; overflow: hidden; }
.A-tx-head { display: grid; grid-template-columns: 32px 1fr 140px 110px 130px 32px; gap: 14px; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--a-divider); font-family: Geist Mono, monospace; font-size: 10.5px; color: var(--a-ink-400); letter-spacing: 0.06em; text-transform: uppercase; background: var(--a-bg); }
.A-tx-body .A-txrow { grid-template-columns: 32px 1fr 140px 110px 130px 32px; padding: 14px 20px; }
.A-tx-body .A-txrow:hover { background: var(--a-hover); }
.A-tx-tag { display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 500; background: var(--a-hover); color: var(--a-ink-700); font-family: inherit; }
.A-tx-actions { color: var(--a-ink-400); cursor: pointer; text-align: right; }
`;
function TransactionsA({ tweaks }) {
  const all = [...TXS, ...TXS]; // more rows
  return (
    <Shell active="transactions" tweaks={tweaks}>
      <style>{DASH_STYLE}</style>
      <style>{TX_STYLE}</style>
      <main className="A-main">
        <div className="A-top">
          <div>
            <h1>Transações</h1>
            <div className="sub">{all.length} registros · Abril 2026</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="A-chip">↑ Exportar CSV</button>
            <button className="A-chip">↓ Importar</button>
            <button className="A-chip primary">+ Nova transação</button>
          </div>
        </div>
        <div className="A-tx-stats">
          <div className="A-tx-stat">
            <div className="l">Total no período</div>
            <div className="v" style={{ color: '#ef4444' }}>
              − R$ 1.292,83
            </div>
          </div>
          <div className="A-tx-stat">
            <div className="l">Receitas</div>
            <div className="v" style={{ color: '#10b981' }}>
              + R$ 3.179,00
            </div>
          </div>
          <div className="A-tx-stat">
            <div className="l">Maior gasto</div>
            <div className="v">R$ 142,80</div>
          </div>
          <div className="A-tx-stat">
            <div className="l">Média diária</div>
            <div className="v">R$ 43,09</div>
          </div>
        </div>
        <div className="A-tx-filter-row">
          <div className="A-search" style={{ flex: 1, maxWidth: 420 }}>
            <span style={{ color: 'var(--a-ink-400)', fontSize: 12 }}>⌕</span>
            <input placeholder="Buscar por descrição, valor, categoria..." />
          </div>
          <button className="A-chip">📅 Abril 2026</button>
          <button className="A-chip active">Todos</button>
          <button className="A-chip">Receitas</button>
          <button className="A-chip">Despesas</button>
          <button className="A-chip">Pix</button>
          <div style={{ flex: 1 }} />
          <button className="A-chip">Limpar</button>
        </div>
        <div className="A-tx-table">
          <div className="A-tx-head">
            <span />
            <span>Descrição</span>
            <span>Categoria</span>
            <span>Data</span>
            <span style={{ textAlign: 'right' }}>Valor</span>
            <span />
          </div>
          <div className="A-tx-body">
            {all.map((t, i) => (
              <div key={i} className="A-txrow">
                <div className="ic">{CAT_EMOJI[t.cat] || '•'}</div>
                <div>
                  <div className="desc">{t.desc}</div>
                  <div className="meta">Conta Corrente · 2372</div>
                </div>
                <span
                  className="A-tx-tag"
                  style={{
                    background: 'color-mix(in oklab, var(--accent) 10%, var(--a-hover))',
                    color: 'var(--accent)',
                  }}
                >
                  {t.cat}
                </span>
                <div className="cat" style={{ textTransform: 'none' }}>
                  {t.date}
                </div>
                <div className={'val ' + (t.value > 0 ? 'pos' : '')}>
                  {t.value > 0 ? '+' : '−'} {fmt(t.value)}
                </div>
                <div className="A-tx-actions">⋯</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Shell>
  );
}

// ═══ SCREEN: CATEGORIES ═════════════════════════════════════════════════════
const CAT_STYLE = `
.A-cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.A-cat-card { padding: 20px; border-radius: 14px; border: 1px solid var(--a-border); background: var(--a-panel); display: flex; flex-direction: column; gap: 14px; cursor: pointer; transition: border-color 120ms ease; }
.A-cat-card:hover { border-color: var(--a-ink-400); }
.A-cat-top { display: flex; align-items: center; justify-content: space-between; }
.A-cat-emoji { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; font-size: 22px; }
.A-cat-name { font-size: 16px; font-weight: 600; letter-spacing: -0.01em; color: var(--a-ink-900); }
.A-cat-meta { font-size: 12px; color: var(--a-ink-500); margin-top: 2px; font-family: Geist Mono, monospace; }
.A-cat-val { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; color: var(--a-ink-900); }
.A-cat-bar { height: 6px; border-radius: 999px; background: var(--a-divider); overflow: hidden; }
.A-cat-bar > span { display: block; height: 100%; border-radius: 999px; }
.A-cat-new { border: 1px dashed var(--a-border); display: grid; place-items: center; padding: 20px; border-radius: 14px; cursor: pointer; min-height: 160px; color: var(--a-ink-500); font-size: 13px; }
.A-cat-new:hover { border-color: var(--accent); color: var(--accent); }
`;
function CategoriesA({ tweaks }) {
  return (
    <Shell active="categories" tweaks={tweaks}>
      <style>{CAT_STYLE}</style>
      <main className="A-main">
        <div className="A-top">
          <div>
            <h1>Categorias</h1>
            <div className="sub">
              {CATEGORIES.length} categorias · {CATEGORIES.reduce((a, c) => a + c.count, 0)}{' '}
              transações classificadas
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="A-chip">📅 Abril 2026</button>
            <button className="A-chip primary">+ Nova categoria</button>
          </div>
        </div>
        <div className="A-cat-grid">
          {CATEGORIES.map((c) => (
            <div key={c.name} className="A-cat-card">
              <div className="A-cat-top">
                <div
                  className="A-cat-emoji"
                  style={{ background: `color-mix(in oklab, ${c.color} 15%, transparent)` }}
                >
                  {c.emoji}
                </div>
                <div style={{ color: 'var(--a-ink-400)', fontSize: 14 }}>⋯</div>
              </div>
              <div>
                <div className="A-cat-name">{c.name}</div>
                <div className="A-cat-meta">{c.count} transações</div>
              </div>
              <div>
                <div className="A-cat-val">{fmt(c.total)}</div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: 'var(--a-ink-500)',
                    fontFamily: 'Geist Mono, monospace',
                    marginTop: 8,
                    marginBottom: 6,
                  }}
                >
                  <span>{c.pct}% DO TOTAL</span>
                </div>
                <div className="A-cat-bar">
                  <span style={{ width: `${c.pct * 2.5}%`, background: c.color }} />
                </div>
              </div>
            </div>
          ))}
          <div className="A-cat-new">+ Criar categoria personalizada</div>
        </div>
      </main>
    </Shell>
  );
}

// ═══ SCREEN: SAVINGS / CAIXINHAS ════════════════════════════════════════════
const SAV_STYLE = `
.A-sv-top-stats { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
.A-sv-hero { padding: 24px 28px; border-radius: 16px; background: var(--a-panel); border: 1px solid var(--a-border); position: relative; overflow: hidden; }
.A-sv-hero::after { content: ''; position: absolute; right: -40px; top: -40px; width: 220px; height: 220px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--accent) 20%, transparent), transparent 70%); }
.A-sv-hero .lbl { font-family: Geist Mono, monospace; font-size: 10.5px; color: var(--a-ink-400); letter-spacing: 0.08em; text-transform: uppercase; position: relative; }
.A-sv-hero .val { font-size: 42px; font-weight: 600; letter-spacing: -0.035em; margin-top: 10px; line-height: 1; color: var(--a-ink-900); position: relative; }
.A-sv-hero .sub { font-size: 13px; color: var(--a-ink-500); margin-top: 8px; position: relative; }

.A-sv-list { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.A-sv-card { padding: 22px; border-radius: 14px; border: 1px solid var(--a-border); background: var(--a-panel); }
.A-sv-card .h { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.A-sv-card .emoji { width: 40px; height: 40px; border-radius: 10px; display: grid; place-items: center; font-size: 20px; }
.A-sv-card .name { font-size: 16px; font-weight: 600; letter-spacing: -0.01em; color: var(--a-ink-900); }
.A-sv-card .target { font-size: 12px; color: var(--a-ink-500); font-family: Geist Mono, monospace; margin-top: 2px; }
.A-sv-card .amt { font-size: 28px; font-weight: 600; letter-spacing: -0.025em; color: var(--a-ink-900); line-height: 1; }
.A-sv-card .of { color: var(--a-ink-400); font-size: 14px; margin-left: 6px; font-family: Geist Mono, monospace; }
.A-sv-card .bar { height: 8px; border-radius: 999px; background: var(--a-divider); margin-top: 14px; overflow: hidden; }
.A-sv-card .bar > span { display: block; height: 100%; border-radius: 999px; }
.A-sv-card .foot { display: flex; justify-content: space-between; margin-top: 10px; font-family: Geist Mono, monospace; font-size: 11px; color: var(--a-ink-500); }
`;
function SavingsA({ tweaks }) {
  const cx = [
    { emoji: '✈️', name: 'Viagem Japão', color: '#0ea5e9', cur: 4800, tgt: 12000, eta: 'Dez 2026' },
    { emoji: '🏠', name: 'Entrada do apê', color: '#6366f1', cur: 18200, tgt: 60000, eta: '2028' },
    { emoji: '🚗', name: 'Carro novo', color: '#8b5cf6', cur: 7500, tgt: 25000, eta: 'Mai 2027' },
    {
      emoji: '🛡️',
      name: 'Reserva de emergência',
      color: '#10b981',
      cur: 9800,
      tgt: 15000,
      eta: '6 meses',
    },
  ];
  return (
    <Shell active="savings" tweaks={tweaks}>
      <style>{SAV_STYLE}</style>
      <main className="A-main">
        <div className="A-top">
          <div>
            <h1>Caixinhas</h1>
            <div className="sub">4 objetivos · R$ 40.300 reservados · 42% da meta total</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="A-chip">↔ Transferir</button>
            <button className="A-chip primary">+ Nova caixinha</button>
          </div>
        </div>
        <div className="A-sv-top-stats">
          <div className="A-sv-hero">
            <div className="lbl">TOTAL RESERVADO</div>
            <div className="val">R$ 40.300,00</div>
            <div className="sub">Rendendo 103% CDI · Última atualização há 3min</div>
          </div>
          <div className="A-sv-card">
            <div
              className="lbl"
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 10.5,
                color: 'var(--a-ink-400)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              META TOTAL
            </div>
            <div className="amt" style={{ marginTop: 10 }}>
              42%
            </div>
            <div className="bar" style={{ marginTop: 14 }}>
              <span
                style={{
                  width: '42%',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                }}
              />
            </div>
            <div className="foot">
              <span>R$ 40.300</span>
              <span>R$ 112.000</span>
            </div>
          </div>
          <div className="A-sv-card">
            <div
              className="lbl"
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 10.5,
                color: 'var(--a-ink-400)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              RENDIMENTO (MÊS)
            </div>
            <div className="amt" style={{ marginTop: 10, color: '#10b981' }}>
              + R$ 412
            </div>
            <div className="foot" style={{ marginTop: 14 }}>
              <span>+1.02%</span>
              <span>vs. mês anterior</span>
            </div>
          </div>
        </div>

        <div className="A-sv-list">
          {cx.map((c) => {
            const pct = Math.round((c.cur / c.tgt) * 100);
            return (
              <div key={c.name} className="A-sv-card">
                <div className="h">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      className="emoji"
                      style={{ background: `color-mix(in oklab, ${c.color} 15%, transparent)` }}
                    >
                      {c.emoji}
                    </div>
                    <div>
                      <div className="name">{c.name}</div>
                      <div className="target">Meta: {c.eta}</div>
                    </div>
                  </div>
                  <button className="A-chip" style={{ height: 30 }}>
                    + Aportar
                  </button>
                </div>
                <div>
                  <span className="amt">{fmt(c.cur)}</span>
                  <span className="of">/ {fmt(c.tgt)}</span>
                </div>
                <div className="bar">
                  <span style={{ width: `${pct}%`, background: c.color }} />
                </div>
                <div className="foot">
                  <span>{pct}% DO OBJETIVO</span>
                  <span>FALTAM {fmt(c.tgt - c.cur)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </Shell>
  );
}

// ═══ SCREEN: PROFILE ════════════════════════════════════════════════════════
const PROF_STYLE = `
.A-prof-grid { display: grid; grid-template-columns: 320px 1fr; gap: 16px; }
.A-field { display: flex; flex-direction: column; gap: 6px; }
.A-field label { font-size: 12px; color: var(--a-ink-500); font-weight: 500; }
.A-field input { height: 42px; padding: 0 14px; border: 1px solid var(--a-border); border-radius: 10px; background: var(--a-chip-bg); color: var(--a-ink-900); font-size: 14px; font-family: inherit; outline: none; }
.A-field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 18%, transparent); }
.A-field input:disabled { color: var(--a-ink-500); background: var(--a-bg); }
.A-section-h { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
.A-section-h .i { width: 28px; height: 28px; border-radius: 8px; background: color-mix(in oklab, var(--accent) 15%, transparent); color: var(--accent); display: grid; place-items: center; font-size: 14px; }
.A-section-h h3 { margin: 0; font-size: 16px; font-weight: 600; letter-spacing: -0.015em; color: var(--a-ink-900); }
.A-section-h .meta { margin-left: auto; font-family: Geist Mono, monospace; font-size: 11px; color: var(--a-ink-400); }
.A-prof-avatar { width: 120px; height: 120px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: white; display: grid; place-items: center; font-size: 38px; font-weight: 600; margin: 0 auto; position: relative; }
.A-prof-avatar .cam { position: absolute; right: 4px; bottom: 4px; width: 32px; height: 32px; border-radius: 50%; background: var(--accent); color: white; display: grid; place-items: center; font-size: 14px; border: 3px solid var(--a-panel); cursor: pointer; }
.A-danger { border-color: #fca5a5 !important; background: color-mix(in oklab, #ef4444 5%, var(--a-panel)) !important; }
.A-danger .i { background: rgba(239,68,68,0.12); color: #ef4444; }
.A-danger p { font-size: 13px; color: var(--a-ink-700); line-height: 1.55; margin: 0 0 14px; }
.A-btn-danger { height: 38px; padding: 0 16px; border: 1px solid #fca5a5; background: var(--a-panel); color: #dc2626; border-radius: 10px; font-weight: 500; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-family: inherit; }
.A-btn-save { height: 38px; padding: 0 16px; background: var(--accent); color: white; border: 0; border-radius: 10px; font-weight: 500; font-size: 13px; cursor: pointer; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; }
`;
function ProfileA({ tweaks }) {
  return (
    <Shell active="profile" tweaks={tweaks}>
      <style>{PROF_STYLE}</style>
      <main className="A-main">
        <div className="A-top">
          <div>
            <h1>Meu Perfil</h1>
            <div className="sub">Gerencie suas informações pessoais e preferências</div>
          </div>
          <button className="A-btn-save">💾 Salvar alterações</button>
        </div>
        <div className="A-prof-grid">
          <div className="A-card" style={{ height: 'fit-content' }}>
            <div className="A-prof-avatar">
              DC<div className="cam">📷</div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: 'var(--a-ink-900)',
                }}
              >
                davyd camargo
              </div>
              <div style={{ fontSize: 13, color: 'var(--a-ink-500)', marginTop: 4 }}>
                davydfontoura@gmail.com
              </div>
              <div
                style={{
                  marginTop: 16,
                  display: 'inline-flex',
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: 'color-mix(in oklab, #10b981 12%, transparent)',
                  color: '#059669',
                  fontSize: 11,
                  fontFamily: 'Geist Mono, monospace',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                ● Ativa e verificada
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="A-card">
              <div className="A-section-h">
                <span className="i">◉</span>
                <h3>Informações Pessoais</h3>
                <span className="meta">ID: 7c102b5d…</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="A-field">
                  <label>Nome completo</label>
                  <input defaultValue="davyd camargo" />
                </div>
                <div className="A-field">
                  <label>Username</label>
                  <input defaultValue="@davydfontoura" />
                </div>
                <div className="A-field" style={{ gridColumn: 'span 2' }}>
                  <label>E-mail (não editável)</label>
                  <input defaultValue="davydfontoura@gmail.com" disabled />
                </div>
              </div>
            </div>
            <div className="A-card">
              <div className="A-section-h">
                <span className="i">✓</span>
                <h3>Segurança</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="A-field">
                  <label>Senha atual</label>
                  <input type="password" defaultValue="••••••••••" />
                </div>
                <div className="A-field">
                  <label>Nova senha</label>
                  <input type="password" placeholder="Digite a nova senha" />
                </div>
              </div>
              <div
                style={{
                  marginTop: 14,
                  padding: 14,
                  borderRadius: 10,
                  background: 'var(--a-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--a-ink-900)' }}>
                    Autenticação em 2 fatores
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--a-ink-500)', marginTop: 2 }}>
                    Adicione uma camada extra de proteção
                  </div>
                </div>
                <button className="A-chip">Ativar</button>
              </div>
            </div>
            <div className="A-card A-danger">
              <div className="A-section-h">
                <span className="i">⚠</span>
                <h3>Zona de Perigo</h3>
              </div>
              <p>
                Ao excluir sua conta, todos os seus dados (transações, categorias, caixinhas e
                perfil) serão removidos permanentemente. Esta ação não pode ser desfeita.
              </p>
              <button className="A-btn-danger">🗑 Excluir minha conta</button>
            </div>
          </div>
        </div>
      </main>
    </Shell>
  );
}

// ═══ SCREEN: LOGIN / SIGNUP ═════════════════════════════════════════════════
const AUTH_STYLE = `
.A-auth { width: 100%; min-height: 100%; display: grid; grid-template-columns: 1fr 1fr; background: var(--a-bg); color: var(--a-ink-900); font-family: Geist, system-ui; }
.A-auth[data-theme="dark"] { --a-bg:#07070f; --a-panel:#0f0f1e; --a-border:#1e1e2e; --a-divider:#17172a; --a-ink-900:#f4f4f7; --a-ink-700:#c8c8d5; --a-ink-500:#8a8a9e; --a-ink-400:#5a5a72; --a-chip-bg:#12121f; }
.A-auth[data-theme="light"] { --a-bg:#fafafb; --a-panel:#ffffff; --a-border:#eaeaf0; --a-divider:#f1f1f7; --a-ink-900:#0c0c1d; --a-ink-700:#3b3b52; --a-ink-500:#6b6b82; --a-ink-400:#9a9ab0; --a-chip-bg:#ffffff; }
.A-auth-form { padding: 56px 64px; display: flex; flex-direction: column; justify-content: center; }
.A-auth-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 48px; }
.A-auth-brand img { width: 32px; height: 32px; }
.A-auth-brand b { font-size: 16px; font-weight: 600; letter-spacing: -0.01em; }
.A-auth-form h1 { margin: 0 0 8px; font-size: 32px; font-weight: 600; letter-spacing: -0.03em; }
.A-auth-form .sub { font-size: 15px; color: var(--a-ink-500); margin-bottom: 36px; }
.A-auth-tabs { display: flex; padding: 4px; background: var(--a-hover, var(--a-divider)); border-radius: 10px; gap: 2px; margin-bottom: 28px; width: fit-content; }
.A-auth-tabs button { flex: 1; appearance: none; border: 0; background: transparent; padding: 8px 20px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 13px; color: var(--a-ink-500); }
.A-auth-tabs button.active { background: var(--a-panel); color: var(--a-ink-900); font-weight: 500; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
.A-auth-social { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
.A-auth-social button { height: 42px; border: 1px solid var(--a-border); background: var(--a-panel); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; font-size: 13.5px; font-weight: 500; color: var(--a-ink-900); cursor: pointer; font-family: inherit; }
.A-auth-or { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; color: var(--a-ink-400); font-size: 11px; font-family: Geist Mono, monospace; letter-spacing: 0.06em; }
.A-auth-or::before, .A-auth-or::after { content: ''; flex: 1; height: 1px; background: var(--a-border); }
.A-auth-form .A-field { margin-bottom: 16px; }
.A-auth-submit { height: 46px; background: var(--a-ink-900); color: var(--a-panel); border: 0; border-radius: 10px; font-weight: 500; font-size: 14px; cursor: pointer; font-family: inherit; margin-top: 8px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.A-auth-foot { margin-top: 24px; font-size: 13px; color: var(--a-ink-500); }
.A-auth-foot a { color: var(--accent); font-weight: 500; text-decoration: none; cursor: pointer; }
.A-auth-form .row { display: flex; justify-content: space-between; align-items: center; margin-top: -4px; margin-bottom: 8px; font-size: 12.5px; }

.A-auth-side { background: linear-gradient(135deg, #1e1b4b 0%, #0c0a36 100%); color: white; padding: 56px 64px; display: flex; flex-direction: column; justify-content: space-between; position: relative; overflow: hidden; }
.A-auth-side::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(600px 400px at 100% 0%, rgba(99,102,241,0.4), transparent 60%), radial-gradient(500px 400px at 0% 100%, rgba(34,211,238,0.2), transparent 60%); }
.A-auth-side::after { content: ''; position: absolute; inset: 0; opacity: 0.15; pointer-events: none;
  background-image: linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 80%);
}
.A-auth-side > * { position: relative; z-index: 1; }
.A-auth-side h2 { font-size: 40px; font-weight: 600; letter-spacing: -0.035em; line-height: 1.05; margin: 0 0 16px; }
.A-auth-side h2 em { font-style: normal; background: linear-gradient(90deg, #a5b4fc, #22d3ee); -webkit-background-clip: text; background-clip: text; color: transparent; }
.A-auth-side p { font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.6; max-width: 420px; }
.A-auth-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.A-auth-stats .s-v { font-size: 32px; font-weight: 600; letter-spacing: -0.03em; color: white; }
.A-auth-stats .s-l { font-family: Geist Mono, monospace; font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 0.08em; text-transform: uppercase; margin-top: 6px; }
`;
function AuthA({ tweaks }) {
  const [mode, setMode] = useStateS('signup');
  const t = tweaks || { theme: 'light', accent: 'indigo' };
  const a = ACCENTS[t.accent] || ACCENTS.indigo;
  return (
    <div
      className="A-auth"
      data-theme={t.theme}
      style={{ '--accent': a.accent, '--accent-2': a.accent2 }}
    >
      <style>{AUTH_STYLE}</style>
      <div className="A-auth-form">
        <div className="A-auth-brand">
          <img src="public/logo-expense-tracker.png" alt="" />
          <b>Expense Tracker</b>
        </div>
        <h1>{mode === 'signup' ? 'Criar conta' : 'Entrar'}</h1>
        <div className="sub">
          {mode === 'signup'
            ? 'Comece a organizar suas finanças em menos de 5 minutos.'
            : 'Bem-vindo de volta. Continue de onde parou.'}
        </div>

        <div className="A-auth-tabs">
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Cadastrar
          </button>
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Entrar
          </button>
        </div>

        <div className="A-auth-social">
          <button>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.79 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.3-.54-1.52.11-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.48 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.56 22.28 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z" />
            </svg>
            GitHub
          </button>
        </div>
        <div className="A-auth-or">OU COM E-MAIL</div>

        {mode === 'signup' && (
          <div className="A-field">
            <label>Nome completo</label>
            <input placeholder="Como devemos te chamar?" />
          </div>
        )}
        <div className="A-field">
          <label>E-mail</label>
          <input type="email" placeholder="Digite seu email" />
        </div>
        <div className="A-field">
          <label>Senha</label>
          <input type="password" placeholder="Mínimo 8 caracteres" />
        </div>

        {mode === 'login' && (
          <div className="row">
            <label
              style={{
                display: 'inline-flex',
                gap: 8,
                alignItems: 'center',
                color: 'var(--a-ink-700)',
              }}
            >
              <input type="checkbox" defaultChecked /> Lembrar de mim
            </label>
            <a style={{ color: 'var(--accent)', fontWeight: 500, cursor: 'pointer' }}>
              Esqueci minha senha
            </a>
          </div>
        )}

        <button className="A-auth-submit">
          {mode === 'signup' ? 'Criar conta grátis' : 'Entrar'} →
        </button>

        <div className="A-auth-foot">
          {mode === 'signup' ? 'Já tem conta? ' : 'Novo por aqui? '}
          <a onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
            {mode === 'signup' ? 'Entre' : 'Crie uma conta'}
          </a>
        </div>
      </div>

      <div className="A-auth-side">
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              fontFamily: 'Geist Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.06em',
              color: 'rgba(255,255,255,0.75)',
              marginBottom: 32,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
              }}
            />{' '}
            100% OPEN SOURCE
          </div>
          <h2>
            Seu dinheiro, <em>sob controle.</em>
          </h2>
          <p>
            Dashboard inteligente, importação de extratos em CSV, categorias customizáveis e
            segurança Supabase. Sem cartão de crédito. Sem pegadinha.
          </p>
        </div>
        <div className="A-auth-stats">
          <div>
            <div className="s-v">5min</div>
            <div className="s-l">Até o primeiro relatório</div>
          </div>
          <div>
            <div className="s-v">R$ 0</div>
            <div className="s-l">Grátis para sempre</div>
          </div>
          <div>
            <div className="s-v">∞</div>
            <div className="s-l">Categorias customizáveis</div>
          </div>
          <div>
            <div className="s-v">RLS</div>
            <div className="s-l">Segurança Supabase</div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  DashboardA,
  TransactionsA,
  CategoriesA,
  SavingsA,
  ProfileA,
  AuthA,
  KPIS,
  CATEGORIES,
  MONTHLY,
  TXS,
  fmt,
  Donut,
});
