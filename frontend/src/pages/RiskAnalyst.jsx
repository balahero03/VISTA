import { useState, useMemo } from 'react';
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid,
  ReferenceLine, ReferenceArea, LineChart, Line, AreaChart, Area, BarChart, Bar,
  Cell, ComposedChart,
} from 'recharts';
import {
  customers, portfolio, portfolioTrend, SIGNALS, eventStream, inr,
} from '../data/mockData';
import { Card, Stat, Badge, KV, tip, axis, scoreTone, velTone, Arrow, Prog } from '../components/ui';

export default function RiskAnalyst() {
  const [selId, setSelId] = useState(customers.find((c) => c.score < 50 && c.velocity > 6)?.id || customers[0].id);
  const [tab, setTab] = useState('trajectory');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  const sel = customers.find((c) => c.id === selId);

  const rows = useMemo(() => customers.filter((c) => {
    if (q && !`${c.name} ${c.id}`.toLowerCase().includes(q.toLowerCase())) return false;
    if (filter === 'accelerating') return c.acceleration > 1.5;
    if (filter === 'hidden') return c.score < 50 && c.velocity > 6;
    if (filter === 'high') return c.score >= 70;
    if (filter === 'improving') return c.velocity < -1;
    return true;
  }), [q, filter]);

  // Merge history and forecast into one continuous series for the trajectory chart.
  const traj = useMemo(() => {
    const h = sel.history.map((p) => ({ label: p.label, actual: p.score }));
    const last = sel.history[sel.history.length - 1].score;
    const f = sel.forecast.map((p) => ({
      label: p.label, forecast: p.forecast, band: [p.lower, p.upper],
    }));
    if (f.length) { h[h.length - 1] = { ...h[h.length - 1], forecast: last, band: [last, last] }; }
    return [...h, ...f];
  }, [sel]);

  const scatter = customers.map((c) => ({
    x: c.score, y: c.velocity, z: c.exposure / 100000,
    id: c.id, name: c.name, tone: scoreTone(c.score),
  }));

  const toneHex = { ok: '#5b9279', warn: '#b08d57', high: '#b5714e', critical: '#a8544f' };

  return (
    <>
      {/* ---- KPI band ---- */}
      <div className="grid g5 mb">
        <Stat label="Customers Monitored" value={portfolio.monitored}
          foot="across 6 branches" />
        <Stat label="Deteriorating" value={portfolio.deteriorating} tone="high"
          delta={`+${portfolio.accelerating}`} deltaDir="up" foot="accelerating" />
        <Stat label="High Risk" value={portfolio.highRisk} tone="critical"
          foot="score ≥ 70" />
        <Stat label="Hidden Risk" value={portfolio.hiddenRisk} tone="warn"
          foot="low score, high velocity" />
        <Stat label="Exposure at Risk" value={inr(portfolio.exposureAtRisk)}
          foot="score ≥ 55" />
      </div>

      {/* ---- Quadrant + distribution ---- */}
      <div className="grid g-2-1 mb">
        <Card title="Stress / Velocity Quadrant"
          hint="Position shows current stress; height shows rate of change"
          right={<span className="tiny muted">Bubble size = exposure</span>}>
          <div style={{ position: 'relative', height: 306 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 12, bottom: 22, left: 4 }}>
                <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" />
                {/* Top-left: still looks healthy, deteriorating fast. */}
                <ReferenceArea x1={0} x2={55} y1={5} y2={22} fill="#b5714e" fillOpacity={0.05} />
                <XAxis type="number" dataKey="x" name="Stress Score" domain={[0, 100]}
                  {...axis} label={{ value: 'Current Stress Score', position: 'insideBottom',
                    offset: -14, fill: '#6b7888', fontSize: 10.5 }} />
                <YAxis type="number" dataKey="y" name="Velocity" domain={[-6, 22]}
                  {...axis} label={{ value: 'Velocity (pts/mo)', angle: -90,
                    position: 'insideLeft', fill: '#6b7888', fontSize: 10.5 }} />
                <ZAxis type="number" dataKey="z" range={[22, 220]} />
                <ReferenceLine y={0} stroke="#3d4a5a" />
                <ReferenceLine x={55} stroke="#3d4a5a" strokeDasharray="3 3" />
                {tip((v, p) => (p.name === 'Velocity' ? `${v > 0 ? '+' : ''}${v}` : v))}
                <Scatter data={scatter} onClick={(d) => setSelId(d.id)}>
                  {scatter.map((d, i) => (
                    <Cell key={i} fill={toneHex[d.tone]}
                      fillOpacity={d.id === selId ? 1 : 0.55}
                      stroke={d.id === selId ? '#dde3ea' : 'none'} strokeWidth={1.5} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <span className="quad-note" style={{ top: 14, left: 62 }}>Deteriorating · not yet visible</span>
            <span className="quad-note" style={{ top: 14, right: 22 }}>Critical</span>
            <span className="quad-note" style={{ bottom: 44, left: 62 }}>Stable</span>
            <span className="quad-note" style={{ bottom: 44, right: 22 }}>Recovering</span>
          </div>
        </Card>

        <div className="col">
          <Card title="Stress Distribution" flush>
            <div style={{ padding: '13px 15px' }}>
              {portfolio.byStress.map((t) => (
                <div key={t.id} style={{ marginBottom: 10 }}>
                  <div className="row" style={{ marginBottom: 4 }}>
                    <span className="tiny">{t.label}</span>
                    <span className="spacer" />
                    <span className="mono tiny muted">{t.count}</span>
                  </div>
                  <Prog value={t.count} max={portfolio.total} tone={t.tone} />
                </div>
              ))}
            </div>
          </Card>
          <Card title="Portfolio Trend" hint="12 weeks">
            <ResponsiveContainer width="100%" height={126}>
              <ComposedChart data={portfolioTrend} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="label" {...axis} interval={2} />
                <YAxis {...axis} />
                {tip()}
                <Bar dataKey="alerts" name="Alerts" fill="#3f5468" radius={[2, 2, 0, 0]} />
                <Line type="monotone" dataKey="avgScore" name="Avg Score"
                  stroke="#b08d57" strokeWidth={1.6} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>

      {/* ---- Queue + detail ---- */}
      <div className="grid g-1-2">
        <Card flush title="Alert Queue"
          right={<span className="tiny muted">{rows.length}</span>}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-soft)' }}>
            <input className="input" placeholder="Search customer or ID…"
              value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 8 }} />
            <div className="pill-filter">
              {[['all', 'All'], ['hidden', 'Hidden Risk'], ['accelerating', 'Accelerating'],
                ['high', 'High Risk'], ['improving', 'Improving']].map(([k, l]) => (
                <button key={k} className={`pill${filter === k ? ' on' : ''}`}
                  onClick={() => setFilter(k)}>{l}</button>
              ))}
            </div>
          </div>
          <div className="table-wrap scroll-y" style={{ maxHeight: 430 }}>
            <table className="table">
              <thead>
                <tr><th>Customer</th><th className="num">Score</th><th className="num">Vel</th><th>Type</th></tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className={`clickable${c.id === selId ? ' sel' : ''}`}
                    onClick={() => setSelId(c.id)}>
                    <td>
                      <div className="cust-cell">
                        <span className="dot" style={{ background: toneHex[scoreTone(c.score)] }} />
                        <div>
                          <div className="cust-name">{c.name}</div>
                          <div className="cust-id">{c.id} · {c.segment}</div>
                        </div>
                      </div>
                    </td>
                    <td className="num" style={{ color: `var(--${scoreTone(c.score)})`, fontWeight: 600 }}>
                      {c.score}
                    </td>
                    <td className="num">
                      <span style={{ color: `var(--${velTone(c.velocity)})` }}>
                        {c.velocity > 0 ? '+' : ''}{c.velocity}
                      </span>
                    </td>
                    <td><Badge tone={c.stress.tone}>{c.stress.label}</Badge></td>
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={4}><div className="empty">No customers match.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ---- Customer detail ---- */}
        <Card flush>
          <div style={{ padding: '13px 15px', borderBottom: '1px solid var(--line-soft)' }}>
            <div className="row">
              <div>
                <div className="row" style={{ gap: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>{sel.name}</h3>
                  <Badge tone={sel.stress.tone}>{sel.stress.label}</Badge>
                </div>
                <div className="tiny muted" style={{ marginTop: 2 }}>
                  {sel.id} · {sel.segment} · {sel.branch} · Customer since {sel.since} · RM {sel.rm}
                </div>
              </div>
              <span className="spacer" />
              <button className="btn">Add Note</button>
              <button className="btn primary">Escalate for Review</button>
            </div>
            <div className="grid g4" style={{ gap: 10, marginTop: 13 }}>
              <div>
                <div className="stat-label">Stress Score</div>
                <div className="stat-value sm" style={{ color: `var(--${scoreTone(sel.score)})` }}>{sel.score}</div>
              </div>
              <div>
                <div className="stat-label">Velocity</div>
                <div className="stat-value sm mono">
                  <Arrow v={sel.velocity} /> {sel.velocity > 0 ? '+' : ''}{sel.velocity}
                  <span className="tiny muted" style={{ fontWeight: 400 }}> /mo</span>
                </div>
              </div>
              <div>
                <div className="stat-label">Acceleration</div>
                <div className="stat-value sm mono">
                  {sel.acceleration > 0 ? '+' : ''}{sel.acceleration}
                  <span className="tiny muted" style={{ fontWeight: 400 }}> /mo²</span>
                </div>
              </div>
              <div>
                <div className="stat-label">8-Week Projection</div>
                <div className="stat-value sm" style={{ color: `var(--${scoreTone(sel.projected)})` }}>
                  {sel.projected}
                </div>
              </div>
            </div>
          </div>

          <div className="tabs">
            {[['trajectory', 'Trajectory'], ['signals', 'Signals'],
              ['shap', 'Explainability'], ['profile', 'Profile']].map(([k, l]) => (
              <button key={k} className={`tab${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          <div className="card-body">
            {tab === 'trajectory' && (
              <>
                <div className="tiny muted mb">
                  Observed stress score over 24 weeks with an 8-week projection.
                  The shaded band shows the forecast confidence interval
                  ({sel.confidence}% confidence).
                </div>
                <ResponsiveContainer width="100%" height={246}>
                  <AreaChart data={traj} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
                    <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="label" {...axis} interval={3} />
                    <YAxis domain={[0, 100]} {...axis} />
                    {tip()}
                    <ReferenceLine y={75} stroke="#a8544f" strokeDasharray="4 4"
                      label={{ value: 'Alert threshold', fill: '#a8544f', fontSize: 10, position: 'insideTopRight' }} />
                    <Area dataKey="band" name="Confidence" stroke="none"
                      fill="#5d7f9e" fillOpacity={0.13} />
                    <Area dataKey="actual" name="Observed" stroke="#8fabc4" strokeWidth={1.8}
                      fill="#5d7f9e" fillOpacity={0.07} dot={false} />
                    <Area dataKey="forecast" name="Forecast" stroke="#b08d57" strokeWidth={1.8}
                      strokeDasharray="5 4" fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="grid g3" style={{ gap: 10, marginTop: 12 }}>
                  <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
                    <div className="stat-label">Projected Crossing</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {sel.weeksToThreshold ? `${sel.weeksToThreshold} weeks` : sel.score >= 75 ? 'Already breached' : 'Not within horizon'}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
                    <div className="stat-label">Direction</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {sel.velocity > 3 ? 'Deteriorating' : sel.velocity > 1 ? 'Drifting' : sel.velocity < -1 ? 'Improving' : 'Stable'}
                      {sel.acceleration > 1.5 && <span className="tiny" style={{ color: 'var(--critical)' }}> · accelerating</span>}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
                    <div className="stat-label">Model Confidence</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{sel.confidence}%</div>
                  </div>
                </div>
              </>
            )}

            {tab === 'signals' && (
              <>
                <div className="sig-row" style={{ paddingTop: 0, borderBottom: '1px solid var(--line)' }}>
                  <span className="stat-label" style={{ margin: 0 }}>Signal</span>
                  <span className="stat-label" style={{ margin: 0 }}>Current vs baseline</span>
                  <span className="stat-label" style={{ margin: 0, textAlign: 'right' }}>Value</span>
                  <span className="stat-label" style={{ margin: 0, textAlign: 'right' }}>Dev</span>
                  <span className="stat-label" style={{ margin: 0, textAlign: 'right' }}>Vel</span>
                </div>
                {SIGNALS.map((s) => {
                  const d = sel.signals[s.key];
                  const pct = Math.min(100, Math.abs(d.deviation));
                  return (
                    <div className="sig-row" key={s.key}>
                      <span className={`sig-name${d.breach ? ' breach' : ''}`}>
                        {d.breach && <span style={{ color: 'var(--high)', marginRight: 5 }}>●</span>}
                        {s.label}
                      </span>
                      <div className="sig-bar">
                        <div className="sig-bar-fill" style={{
                          width: `${pct}%`,
                          background: d.breach ? 'var(--high)' : 'var(--accent)',
                          opacity: d.breach ? 0.9 : 0.5,
                        }} />
                        <span className="sig-baseline" style={{ left: '38%' }} />
                      </div>
                      <span className="sig-val">{d.value}<span className="muted tiny"> {s.unit}</span></span>
                      <span className="sig-dev" style={{ color: d.breach ? 'var(--high)' : 'var(--text-3)' }}>
                        {d.deviation > 0 ? '+' : ''}{d.deviation}%
                      </span>
                      <span className="sig-dev"><Arrow v={d.velocity} /></span>
                    </div>
                  );
                })}
                <div className="tiny muted" style={{ marginTop: 11 }}>
                  Deviation is measured against this customer's own 180-day baseline,
                  not a population threshold. Marked signals exceed the configured tolerance.
                </div>
              </>
            )}

            {tab === 'shap' && (
              <>
                <div className="tiny muted mb">
                  SHAP attribution — contribution of each signal to the current stress score.
                  Positive values push the score upward.
                </div>
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={sel.contribs} layout="vertical"
                    margin={{ top: 4, right: 16, bottom: 0, left: 96 }}>
                    <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" horizontal={false} />
                    <XAxis type="number" {...axis} />
                    <YAxis type="category" dataKey="label" {...axis} width={94} />
                    {tip((v) => `${v > 0 ? '+' : ''}${v}`)}
                    <ReferenceLine x={0} stroke="#3d4a5a" />
                    <Bar dataKey="value" name="Contribution" radius={[0, 2, 2, 0]}>
                      {sel.contribs.map((c, i) => (
                        <Cell key={i} fill={c.value > 0 ? '#a8544f' : '#5b9279'} fillOpacity={0.85} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="card" style={{ padding: 12, background: 'var(--surface-2)', marginTop: 12 }}>
                  <div className="stat-label">Narrative</div>
                  <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text-2)' }}>
                    {sel.name} is classified as <strong style={{ color: 'var(--text)' }}>{sel.stress.label}</strong>.
                    The dominant contributor is <strong style={{ color: 'var(--text)' }}>{sel.contribs[0].label}</strong>
                    {' '}({sel.contribs[0].value > 0 ? '+' : ''}{sel.contribs[0].value} points),
                    followed by {sel.contribs[1].label} ({sel.contribs[1].value > 0 ? '+' : ''}{sel.contribs[1].value}).
                    {sel.velocity > 3
                      ? ` The condition is deteriorating at ${sel.velocity} points per month${sel.acceleration > 1.5 ? ', and the rate of deterioration is itself increasing' : ''}.`
                      : sel.velocity < -1 ? ' The condition is improving.' : ' The condition is broadly stable.'}
                  </div>
                </div>
              </>
            )}

            {tab === 'profile' && (
              <div className="grid g2" style={{ gap: 18 }}>
                <div>
                  <div className="stat-label">Relationship</div>
                  <KV k="Customer ID" v={<span className="mono">{sel.id}</span>} />
                  <KV k="Segment" v={sel.segment} />
                  <KV k="Branch" v={sel.branch} />
                  <KV k="Customer since" v={sel.since} />
                  <KV k="Relationship Manager" v={sel.rm} />
                  <KV k="Total exposure" v={<span className="mono">{inr(sel.exposure)}</span>} />
                </div>
                <div>
                  <div className="stat-label">Assessment</div>
                  <KV k="Stress score" v={<span style={{ color: `var(--${scoreTone(sel.score)})`, fontWeight: 600 }}>{sel.score}</span>} />
                  <KV k="Classification" v={<Badge tone={sel.stress.tone}>{sel.stress.label}</Badge>} />
                  <KV k="Velocity" v={<span className="mono">{sel.velocity > 0 ? '+' : ''}{sel.velocity} /mo</span>} />
                  <KV k="Acceleration" v={<span className="mono">{sel.acceleration > 0 ? '+' : ''}{sel.acceleration} /mo²</span>} />
                  <KV k="Breached signals" v={`${sel.drivers.length} of ${SIGNALS.length}`} />
                  <KV k="Last event" v={<span className="muted">{sel.lastEvent}</span>} />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ---- Live stream ---- */}
      <div className="grid g-3-2" style={{ marginTop: 14 }}>
        <Card title="Live Event Stream" hint="Kafka — financial events"
          right={<Badge tone="ok"><span className="dot ok" /> Connected</Badge>} flush>
          <div className="table-wrap" style={{ maxHeight: 214, overflowY: 'auto' }}>
            <table className="table">
              <thead><tr><th>Time</th><th>Event</th><th>Customer</th><th>Detail</th></tr></thead>
              <tbody>
                {eventStream.map((e, i) => (
                  <tr key={i}>
                    <td className="mono muted tiny">{e.ts}</td>
                    <td><Badge tone={e.type.includes('FAIL') ? 'critical'
                      : e.type.includes('SPIKE') || e.type.includes('DRAWDOWN') ? 'warn' : 'neutral'}>
                      {e.type.replace(/_/g, ' ')}</Badge></td>
                    <td className="mono tiny">{e.customer}</td>
                    <td className="muted">{e.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Signal Breach Frequency" hint="Portfolio-wide, this week">
          <ResponsiveContainer width="100%" height={214}>
            <BarChart data={SIGNALS.map((s) => ({
              label: s.label.split(' ')[0],
              count: customers.filter((c) => c.signals[s.key].breach).length,
            }))} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="label" {...axis} angle={-25} textAnchor="end" height={52} interval={0} />
              <YAxis {...axis} />
              {tip()}
              <Bar dataKey="count" name="Customers" fill="#5d7f9e" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}
