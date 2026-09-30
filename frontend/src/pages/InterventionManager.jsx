import { useState, useMemo } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ReferenceLine, BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts';
import { cases, SIGNALS, inr } from '../data/mockData';
import { Card, Stat, Badge, KV, tip, axis, scoreTone, Arrow } from '../components/ui';

const PRIORITY_TONE = { High: 'critical', Medium: 'high', Low: 'warn' };
const STATUS_TONE = {
  'Pending Approval': 'warn', Approved: 'accent', Executing: 'accent',
  Completed: 'ok', Rejected: 'neutral',
};

export default function InterventionManager() {
  const pending = useMemo(() => cases.filter((c) => c.status === 'Pending Approval'), []);
  const [selId, setSelId] = useState(pending[0]?.caseId || cases[0].caseId);
  const [statusFilter, setStatusFilter] = useState('Pending Approval');
  const [decisions, setDecisions] = useState({});
  const [draft, setDraft] = useState({});
  const [reason, setReason] = useState({});
  const [tab, setTab] = useState('recommendation');

  const list = useMemo(
    () => (statusFilter === 'All' ? cases : cases.filter((c) => c.status === statusFilter)),
    [statusFilter],
  );

  const sel = cases.find((c) => c.caseId === selId) || cases[0];
  const c = sel.customer;
  const decision = decisions[sel.caseId];
  const draftText = draft[sel.caseId] ?? c.draft.replace('{name}', c.name.split(' ')[0]).replace('{rm}', sel.assignedRm);
  const edited = draft[sel.caseId] !== undefined && draft[sel.caseId] !== c.draft.replace('{name}', c.name.split(' ')[0]).replace('{rm}', sel.assignedRm);

  const traj = useMemo(() => {
    const h = c.history.slice(-12).map((p) => ({ label: p.label, actual: p.score }));
    const last = c.history[c.history.length - 1].score;
    const f = c.forecast.map((p) => ({ label: p.label, forecast: p.forecast, band: [p.lower, p.upper] }));
    if (f.length) h[h.length - 1] = { ...h[h.length - 1], forecast: last, band: [last, last] };
    return [...h, ...f];
  }, [c]);

  function decide(verdict) {
    if (!reason[sel.caseId] && verdict === 'Rejected') return;
    setDecisions({ ...decisions, [sel.caseId]: { verdict, at: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), edited } });
  }

  const slaBuckets = [
    { label: '< 4h', count: 4 }, { label: '4–12h', count: 6 },
    { label: '12–24h', count: 3 }, { label: '> 24h', count: 2 },
  ];
  const byType = useMemo(() => {
    const m = {};
    cases.forEach((x) => { m[x.customer.stress.label] = (m[x.customer.stress.label] || 0) + 1; });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, []);
  const PIE = ['#5d7f9e', '#8a7b9e', '#b08d57', '#b5714e', '#a8544f', '#5b9279'];

  return (
    <>
      <div className="grid g5 mb">
        <Stat label="Awaiting Approval" value={pending.length} tone="warn" foot="in your queue" />
        <Stat label="Approved Today" value={cases.filter((x) => x.status === 'Approved').length} tone="ok" foot="ready for execution" />
        <Stat label="In Execution" value={cases.filter((x) => x.status === 'Executing').length} foot="with relationship managers" />
        <Stat label="Median Decision Time" value="6.2h" foot="SLA 24h" />
        <Stat label="Approval Limit" value={inr(500000)} foot="per intervention" />
      </div>

      <div className="grid g-1-2 mb">
        {/* ---- Case queue ---- */}
        <Card flush title="Case Queue" right={<span className="tiny muted">{list.length}</span>}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line-soft)' }}>
            <div className="pill-filter">
              {['Pending Approval', 'Approved', 'Executing', 'Completed', 'All'].map((s) => (
                <button key={s} className={`pill${statusFilter === s ? ' on' : ''}`}
                  onClick={() => setStatusFilter(s)}>{s}</button>
              ))}
            </div>
          </div>
          <div className="table-wrap scroll-y" style={{ maxHeight: 494 }}>
            <table className="table">
              <thead><tr><th>Case</th><th>Customer</th><th className="num">Score</th><th>Priority</th></tr></thead>
              <tbody>
                {list.map((x) => (
                  <tr key={x.caseId} className={`clickable${x.caseId === selId ? ' sel' : ''}`}
                    onClick={() => setSelId(x.caseId)}>
                    <td>
                      <div className="mono tiny" style={{ fontWeight: 600 }}>{x.caseId}</div>
                      <div className="tiny muted">{x.raisedAt.slice(5)}</div>
                    </td>
                    <td>
                      <div className="cust-name">{x.customer.name}</div>
                      <div className="cust-id">{x.customerId}</div>
                    </td>
                    <td className="num" style={{ color: `var(--${scoreTone(x.customer.score)})`, fontWeight: 600 }}>
                      {x.customer.score}
                    </td>
                    <td>
                      <Badge tone={decisions[x.caseId] ? 'ok' : PRIORITY_TONE[x.priority]}>
                        {decisions[x.caseId]?.verdict || x.priority}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {!list.length && <tr><td colSpan={4}><div className="empty">No cases in this state.</div></td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ---- Decision panel ---- */}
        <Card flush>
          <div style={{ padding: '13px 15px', borderBottom: '1px solid var(--line-soft)' }}>
            <div className="row">
              <div>
                <div className="row" style={{ gap: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>{sel.caseId}</h3>
                  <Badge tone={STATUS_TONE[sel.status]}>{decision?.verdict || sel.status}</Badge>
                  <Badge tone={PRIORITY_TONE[sel.priority]}>{sel.priority} priority</Badge>
                </div>
                <div className="tiny muted" style={{ marginTop: 2 }}>
                  {c.name} · {c.id} · Raised {sel.raisedAt} by {sel.raisedBy}
                </div>
              </div>
            </div>
          </div>

          <div className="tabs">
            {[['recommendation', 'Recommendation'], ['evidence', 'Evidence'],
              ['communication', 'Communication'], ['history', 'Case History']].map(([k, l]) => (
              <button key={k} className={`tab${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          <div className="card-body">
            {tab === 'recommendation' && (
              <>
                <div className="grid g4" style={{ gap: 10, marginBottom: 14 }}>
                  <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
                    <div className="stat-label">Stress Score</div>
                    <div style={{ fontSize: 19, fontWeight: 600, color: `var(--${scoreTone(c.score)})` }}>{c.score}</div>
                  </div>
                  <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
                    <div className="stat-label">Velocity</div>
                    <div style={{ fontSize: 19, fontWeight: 600 }} className="mono">
                      <Arrow v={c.velocity} /> {c.velocity > 0 ? '+' : ''}{c.velocity}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
                    <div className="stat-label">Classification</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 4 }}>{c.stress.label}</div>
                  </div>
                  <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
                    <div className="stat-label">Exposure</div>
                    <div style={{ fontSize: 19, fontWeight: 600 }} className="mono">{inr(c.exposure)}</div>
                  </div>
                </div>

                <div className="card" style={{ padding: 14, background: 'var(--accent-bg)', border: '1px solid var(--accent-line)', marginBottom: 14 }}>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <span className="stat-label" style={{ margin: 0, color: 'var(--accent-text)' }}>Recommended Action</span>
                    <span className="spacer" />
                    <Badge tone="accent">System generated</Badge>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>{c.recommendation.action}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text-2)' }}>{c.recommendation.detail}</div>
                </div>

                <div className="stat-label">Projected Trajectory</div>
                <ResponsiveContainer width="100%" height={168}>
                  <AreaChart data={traj} margin={{ top: 6, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="label" {...axis} interval={2} />
                    <YAxis domain={[0, 100]} {...axis} />
                    {tip()}
                    <ReferenceLine y={75} stroke="#a8544f" strokeDasharray="4 4" />
                    <Area dataKey="band" name="Confidence" stroke="none" fill="#5d7f9e" fillOpacity={0.13} />
                    <Area dataKey="actual" name="Observed" stroke="#8fabc4" strokeWidth={1.7} fill="#5d7f9e" fillOpacity={0.07} dot={false} />
                    <Area dataKey="forecast" name="Forecast" stroke="#b08d57" strokeWidth={1.7} strokeDasharray="5 4" fill="none" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}

            {tab === 'evidence' && (
              <>
                <div className="tiny muted mb">
                  Signals contributing to this classification, with SHAP attribution.
                </div>
                <ResponsiveContainer width="100%" height={192}>
                  <BarChart data={c.contribs} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 96 }}>
                    <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" horizontal={false} />
                    <XAxis type="number" {...axis} />
                    <YAxis type="category" dataKey="label" {...axis} width={94} />
                    {tip((v) => `${v > 0 ? '+' : ''}${v}`)}
                    <ReferenceLine x={0} stroke="#3d4a5a" />
                    <Bar dataKey="value" name="Contribution" radius={[0, 2, 2, 0]}>
                      {c.contribs.map((x, i) => <Cell key={i} fill={x.value > 0 ? '#a8544f' : '#5b9279'} fillOpacity={0.85} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ marginTop: 12 }}>
                  <div className="stat-label">Breached Signals</div>
                  {SIGNALS.filter((s) => c.signals[s.key].breach).map((s) => (
                    <KV key={s.key} k={s.label}
                      v={<span className="mono" style={{ color: 'var(--high)' }}>
                        {c.signals[s.key].value} {s.unit} ({c.signals[s.key].deviation > 0 ? '+' : ''}{c.signals[s.key].deviation}%)
                      </span>} />
                  ))}
                  {!c.drivers.length && <div className="tiny muted">No signals currently breached.</div>}
                </div>
              </>
            )}

            {tab === 'communication' && (
              <>
                <div className="row mb">
                  <span className="stat-label" style={{ margin: 0 }}>Draft Customer Communication</span>
                  <span className="spacer" />
                  <Badge tone={edited ? 'warn' : 'accent'}>{edited ? 'Modified by reviewer' : 'Generative AI draft'}</Badge>
                </div>
                <textarea className="textarea" rows={15} value={draftText}
                  onChange={(e) => setDraft({ ...draft, [sel.caseId]: e.target.value })} />
                <div className="row tiny muted" style={{ marginTop: 8 }}>
                  <span>Generated from the detected condition and contributing signals. Edits are recorded in the audit trail.</span>
                  <span className="spacer" />
                  <button className="btn sm" onClick={() => { const d = { ...draft }; delete d[sel.caseId]; setDraft(d); }}>
                    Reset to original
                  </button>
                </div>
              </>
            )}

            {tab === 'history' && (
              <div className="tl">
                {[
                  { t: 'Risk detected by VISTA engine', s: `Score ${c.score}, velocity ${c.velocity > 0 ? '+' : ''}${c.velocity}`, ts: sel.raisedAt, done: true },
                  { t: 'Signals validated by analyst', s: sel.raisedBy, ts: sel.raisedAt, done: true },
                  { t: 'Recommendation generated', s: c.recommendation.action, ts: sel.raisedAt, done: true },
                  { t: 'Awaiting human approval', s: decision ? `${decision.verdict} at ${decision.at}` : 'Pending your decision', ts: '—', done: !!decision, active: !decision },
                  { t: 'Intervention execution', s: `Assigned to ${sel.assignedRm}`, ts: '—', done: false },
                  { t: 'Outcome recorded', s: 'Pending', ts: '—', done: false },
                ].map((s, i) => (
                  <div className="tl-item" key={i}>
                    <span className={`tl-dot${s.done ? ' done' : s.active ? ' active' : ''}`} />
                    <div style={{ fontSize: 12.5, fontWeight: 550 }}>{s.t}</div>
                    <div className="tiny muted">{s.s} · {s.ts}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ---- Decision bar ---- */}
          <div style={{ padding: '12px 15px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)' }}>
            {decision ? (
              <div className="row">
                <Badge tone={decision.verdict === 'Approved' ? 'ok' : 'critical'}>
                  {decision.verdict} at {decision.at}
                </Badge>
                <span className="tiny muted">
                  {decision.edited ? 'Communication was modified before approval. ' : ''}
                  Committed to Drunix ledger.
                </span>
                <span className="spacer" />
                <button className="btn sm" onClick={() => { const d = { ...decisions }; delete d[sel.caseId]; setDecisions(d); }}>
                  Undo
                </button>
              </div>
            ) : (
              <>
                <input className="input" placeholder="Decision rationale (required for rejection)…"
                  value={reason[sel.caseId] || ''}
                  onChange={(e) => setReason({ ...reason, [sel.caseId]: e.target.value })}
                  style={{ marginBottom: 9 }} />
                <div className="row">
                  <span className="tiny muted">
                    Approving commits this decision, the recommendation and the final
                    communication to the audit ledger.
                  </span>
                  <span className="spacer" />
                  <button className="btn danger" onClick={() => decide('Rejected')}
                    disabled={!reason[sel.caseId]}>Reject</button>
                  <button className="btn" onClick={() => decide('Approved')}>Approve with changes</button>
                  <button className="btn primary" onClick={() => decide('Approved')}>Approve</button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="grid g3">
        <Card title="Queue Age" hint="Time since case raised">
          <ResponsiveContainer width="100%" height={176}>
            <BarChart data={slaBuckets} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="label" {...axis} /><YAxis {...axis} />
              {tip()}
              <Bar dataKey="count" name="Cases" radius={[2, 2, 0, 0]}>
                {slaBuckets.map((b, i) => (
                  <Cell key={i} fill={i === 3 ? '#a8544f' : i === 2 ? '#b08d57' : '#5d7f9e'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Cases by Stress Type">
          <ResponsiveContainer width="100%" height={176}>
            <PieChart>
              <Pie data={byType} dataKey="value" nameKey="name" cx="50%" cy="50%"
                innerRadius={40} outerRadius={66} paddingAngle={2} stroke="none">
                {byType.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} fillOpacity={0.85} />)}
              </Pie>
              {tip()}
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: 'center' }}>
            {byType.map((t, i) => (
              <span key={t.name} className="tiny muted row" style={{ gap: 5 }}>
                <span className="dot" style={{ background: PIE[i % PIE.length] }} />{t.name}
              </span>
            ))}
          </div>
        </Card>
        <Card title="Decision Summary" hint="Last 30 days">
          <KV k="Total reviewed" v="142" />
          <KV k="Approved as recommended" v={<span style={{ color: 'var(--ok)' }}>96 (68%)</span>} />
          <KV k="Approved with changes" v={<span style={{ color: 'var(--warn)' }}>31 (22%)</span>} />
          <KV k="Rejected" v={<span style={{ color: 'var(--text-2)' }}>15 (10%)</span>} />
          <KV k="Median decision time" v="6.2 hours" />
          <KV k="Escalated to senior review" v="8" />
          <div className="tiny muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
            A 22% modification rate indicates active human oversight rather than
            routine acceptance of system recommendations.
          </div>
        </Card>
      </div>
    </>
  );
}
