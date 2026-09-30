import { useState, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  ReferenceLine, AreaChart, Area,
} from 'recharts';
import { cases, RM_NAMES, inr } from '../data/mockData';
import { Card, Stat, Badge, KV, tip, axis, scoreTone, Arrow, Prog } from '../components/ui';

const ME = RM_NAMES[0]; // S. Krishnan

const CHANNELS = ['Phone call', 'Email', 'SMS', 'Branch visit', 'Mobile app message'];

export default function RelationshipManager() {
  // Only cases assigned to this relationship manager, and only past approval.
  const mine = useMemo(
    () => cases.filter((x) => x.assignedRm === ME && x.status !== 'Pending Approval'),
    [],
  );
  const queue = mine.length ? mine : cases.slice(0, 6);

  const [selId, setSelId] = useState(queue[0].caseId);
  const [logs, setLogs] = useState({});
  const [form, setForm] = useState({ channel: CHANNELS[0], outcome: 'Contacted — plan accepted', note: '' });
  const [tab, setTab] = useState('action');

  const sel = queue.find((x) => x.caseId === selId) || queue[0];
  const c = sel.customer;
  const myLogs = logs[sel.caseId] || [];

  const draftText = c.draft.replace('{name}', c.name.split(' ')[0]).replace('{rm}', ME);

  // Before / after trajectory for completed cases.
  const outcome = useMemo(() => {
    const pre = c.history.slice(-10).map((p, i) => ({ label: `W-${9 - i}`, before: p.score }));
    const shift = sel.improvement ?? -10;
    const post = Array.from({ length: 6 }, (_, i) => {
      const noIntervention = c.score + c.velocity * ((i + 1) / 4);
      const withIntervention = c.score + (c.velocity + shift) * ((i + 1) / 4);
      return {
        label: `W+${i + 1}`,
        counterfactual: Math.max(2, Math.min(98, Math.round(noIntervention))),
        actual: Math.max(2, Math.min(98, Math.round(withIntervention))),
      };
    });
    const join = { label: 'Action', before: c.score, counterfactual: c.score, actual: c.score };
    return [...pre, join, ...post];
  }, [c, sel]);

  function addLog() {
    const entry = {
      ts: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      ...form,
    };
    setLogs({ ...logs, [sel.caseId]: [entry, ...myLogs] });
    setForm({ ...form, note: '' });
  }

  const completed = queue.filter((x) => x.status === 'Completed');
  const avgImprove = completed.length
    ? Math.round(completed.reduce((s, x) => s + (x.improvement || 0), 0) / completed.length)
    : 0;

  return (
    <>
      <div className="grid g5 mb">
        <Stat label="Assigned Cases" value={queue.length} foot={`managed by ${ME}`} />
        <Stat label="Awaiting Action" value={queue.filter((x) => x.status === 'Approved').length} tone="warn" foot="approved, not yet contacted" />
        <Stat label="In Progress" value={queue.filter((x) => x.status === 'Executing').length} foot="customer engaged" />
        <Stat label="Completed" value={completed.length} tone="ok" foot="outcome recorded" />
        <Stat label="Avg Trajectory Shift" value={`${avgImprove}`} tone="ok" foot="points, post-intervention" />
      </div>

      <div className="grid g-1-2 mb">
        <Card flush title="My Cases" right={<span className="tiny muted">{queue.length}</span>}>
          <div className="table-wrap scroll-y" style={{ maxHeight: 520 }}>
            <table className="table">
              <thead><tr><th>Customer</th><th>Action</th><th>Status</th></tr></thead>
              <tbody>
                {queue.map((x) => (
                  <tr key={x.caseId} className={`clickable${x.caseId === selId ? ' sel' : ''}`}
                    onClick={() => setSelId(x.caseId)}>
                    <td>
                      <div className="cust-name">{x.customer.name}</div>
                      <div className="cust-id">{x.customerId} · {x.caseId}</div>
                    </td>
                    <td className="tiny muted" style={{ maxWidth: 140 }}>
                      {x.customer.recommendation.action}
                    </td>
                    <td>
                      <Badge tone={x.status === 'Completed' ? 'ok'
                        : x.status === 'Executing' ? 'accent'
                          : x.status === 'Rejected' ? 'neutral' : 'warn'}>
                        {x.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card flush>
          <div style={{ padding: '13px 15px', borderBottom: '1px solid var(--line-soft)' }}>
            <div className="row">
              <div>
                <div className="row" style={{ gap: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</h3>
                  <Badge tone={c.stress.tone}>{c.stress.label}</Badge>
                  <Badge tone={sel.status === 'Completed' ? 'ok' : 'accent'}>{sel.status}</Badge>
                </div>
                <div className="tiny muted" style={{ marginTop: 2 }}>
                  {c.id} · {sel.caseId} · {c.segment} · {c.branch} · Approved by {sel.approver || '—'}
                </div>
              </div>
              <span className="spacer" />
              <button className="btn">Call</button>
              <button className="btn primary">Send Communication</button>
            </div>
          </div>

          <div className="tabs">
            {[['action', 'Approved Action'], ['message', 'Communication'],
              ['log', 'Contact Log'], ['outcome', 'Outcome']].map(([k, l]) => (
              <button key={k} className={`tab${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          <div className="card-body">
            {tab === 'action' && (
              <>
                <div className="card" style={{ padding: 14, background: 'var(--ok-bg)', border: '1px solid var(--ok-line)', marginBottom: 14 }}>
                  <div className="row" style={{ marginBottom: 6 }}>
                    <span className="stat-label" style={{ margin: 0, color: 'var(--ok)' }}>Approved Intervention</span>
                    <span className="spacer" />
                    <Badge tone="ok">Cleared for execution</Badge>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>{c.recommendation.action}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text-2)' }}>{c.recommendation.detail}</div>
                </div>

                <div className="grid g2" style={{ gap: 18 }}>
                  <div>
                    <div className="stat-label">Customer Context</div>
                    <KV k="Segment" v={c.segment} />
                    <KV k="Customer since" v={c.since} />
                    <KV k="Total exposure" v={<span className="mono">{inr(c.exposure)}</span>} />
                    <KV k="Branch" v={c.branch} />
                  </div>
                  <div>
                    <div className="stat-label">Why This Case</div>
                    <KV k="Stress score" v={<span style={{ color: `var(--${scoreTone(c.score)})`, fontWeight: 600 }}>{c.score}</span>} />
                    <KV k="Velocity" v={<span className="mono"><Arrow v={c.velocity} /> {c.velocity > 0 ? '+' : ''}{c.velocity}/mo</span>} />
                    <KV k="Primary driver" v={c.contribs[0].label} />
                    <KV k="Priority" v={sel.priority} />
                  </div>
                </div>

                <div className="card" style={{ padding: 12, background: 'var(--surface-2)', marginTop: 14 }}>
                  <div className="stat-label">Talking Points</div>
                  <ul style={{ paddingLeft: 17, fontSize: 12, lineHeight: 1.75, color: 'var(--text-2)' }}>
                    <li>Lead with the offer, not the problem. Do not imply the customer is in difficulty.</li>
                    <li>Primary signal is <strong style={{ color: 'var(--text)' }}>{c.contribs[0].label.toLowerCase()}</strong> — frame the support around this.</li>
                    <li>Confirm whether any change in circumstances is temporary or ongoing.</li>
                    <li>Record the outcome in the contact log immediately after the conversation.</li>
                  </ul>
                </div>
              </>
            )}

            {tab === 'message' && (
              <>
                <div className="row mb">
                  <span className="stat-label" style={{ margin: 0 }}>Approved Communication</span>
                  <span className="spacer" />
                  <Badge tone="ok">Approved — do not alter</Badge>
                </div>
                <div className="card" style={{ padding: 14, background: 'var(--bg)', border: '1px solid var(--line)' }}>
                  <pre style={{ fontFamily: 'var(--sans)', fontSize: 12.5, lineHeight: 1.75,
                    whiteSpace: 'pre-wrap', color: 'var(--text-2)', margin: 0 }}>{draftText}</pre>
                </div>
                <div className="row" style={{ marginTop: 11 }}>
                  <span className="tiny muted">
                    This text was approved by {sel.approver || 'the intervention manager'}. Changes require re-approval.
                  </span>
                  <span className="spacer" />
                  <button className="btn sm">Copy</button>
                  <button className="btn sm">Request amendment</button>
                </div>
              </>
            )}

            {tab === 'log' && (
              <>
                <div className="grid g3" style={{ gap: 9, marginBottom: 11 }}>
                  <div>
                    <label className="field-label">Channel</label>
                    <select className="select" value={form.channel}
                      onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                      {CHANNELS.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="field-label">Outcome</label>
                    <select className="select" value={form.outcome}
                      onChange={(e) => setForm({ ...form, outcome: e.target.value })}>
                      {['Contacted — plan accepted', 'Contacted — considering',
                        'Contacted — declined', 'No answer', 'Callback requested',
                        'Wrong contact details'].map((x) => <option key={x}>{x}</option>)}
                    </select>
                  </div>
                </div>
                <label className="field-label">Note</label>
                <textarea className="textarea" rows={3} placeholder="Summary of the conversation…"
                  value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                <div className="row" style={{ marginTop: 9, marginBottom: 14 }}>
                  <span className="tiny muted">Contact records form part of the case audit trail.</span>
                  <span className="spacer" />
                  <button className="btn primary" onClick={addLog} disabled={!form.note}>Record Contact</button>
                </div>

                <div className="stat-label">History</div>
                {[...myLogs, ...(sel.status !== 'Approved' ? [
                  { ts: '28 Sep 11:20', channel: 'Phone call', outcome: 'Contacted — plan accepted', note: 'Customer confirmed salary delay is temporary. Agreed to EMI date change.' },
                  { ts: '26 Sep 09:05', channel: 'SMS', outcome: 'No answer', note: 'Initial outreach message sent.' },
                ] : [])].map((l, i) => (
                  <div key={i} style={{ padding: '9px 0', borderBottom: '1px solid var(--line-soft)' }}>
                    <div className="row" style={{ gap: 8 }}>
                      <Badge tone={l.outcome.includes('accepted') ? 'ok'
                        : l.outcome.includes('declined') ? 'critical'
                          : l.outcome.includes('No answer') ? 'neutral' : 'warn'}>{l.outcome}</Badge>
                      <span className="tiny muted">{l.channel}</span>
                      <span className="spacer" />
                      <span className="tiny muted mono">{l.ts}</span>
                    </div>
                    <div className="tiny" style={{ color: 'var(--text-2)', marginTop: 4 }}>{l.note}</div>
                  </div>
                ))}
              </>
            )}

            {tab === 'outcome' && (
              <>
                <div className="tiny muted mb">
                  Observed trajectory following intervention, against the projection had
                  no action been taken.
                </div>
                <ResponsiveContainer width="100%" height={216}>
                  <LineChart data={outcome} margin={{ top: 6, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="label" {...axis} interval={1} />
                    <YAxis domain={[0, 100]} {...axis} />
                    {tip()}
                    <ReferenceLine y={75} stroke="#a8544f" strokeDasharray="4 4" />
                    <ReferenceLine x="Action" stroke="#5d7f9e" strokeDasharray="3 3"
                      label={{ value: 'Intervention', fill: '#8fabc4', fontSize: 10, position: 'top' }} />
                    <Line dataKey="before" name="Observed" stroke="#8fabc4" strokeWidth={1.8} dot={false} />
                    <Line dataKey="counterfactual" name="No intervention" stroke="#a8544f"
                      strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    <Line dataKey="actual" name="Post-intervention" stroke="#5b9279" strokeWidth={1.8} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="grid g3" style={{ gap: 10, marginTop: 12 }}>
                  <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
                    <div className="stat-label">Trajectory Shift</div>
                    <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ok)' }} className="mono">
                      {sel.improvement ?? -10} pts
                    </div>
                  </div>
                  <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
                    <div className="stat-label">Status</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 4 }}>
                      {sel.status === 'Completed' ? 'Outcome recorded' : 'Monitoring'}
                    </div>
                  </div>
                  <div className="card" style={{ padding: 11, background: 'var(--surface-2)' }}>
                    <div className="stat-label">Assessment</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 4 }}>
                      {(sel.improvement ?? -10) < -12 ? 'Effective' : 'Partial'}
                    </div>
                  </div>
                </div>
                {sel.outcomeNote && (
                  <div className="card" style={{ padding: 12, background: 'var(--surface-2)', marginTop: 11 }}>
                    <div className="stat-label">Note</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{sel.outcomeNote}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>

      <div className="grid g3">
        <Card title="My Portfolio Health" hint="Assigned customers">
          {queue.slice(0, 6).map((x) => (
            <div key={x.caseId} style={{ marginBottom: 11 }}>
              <div className="row tiny" style={{ marginBottom: 4 }}>
                <span>{x.customer.name}</span>
                <span className="spacer" />
                <span className="mono" style={{ color: `var(--${scoreTone(x.customer.score)})` }}>
                  {x.customer.score}
                </span>
              </div>
              <Prog value={x.customer.score} tone={scoreTone(x.customer.score)} />
            </div>
          ))}
        </Card>
        <Card title="Contact Effectiveness" hint="Your last 30 days">
          <KV k="Contacts attempted" v="48" />
          <KV k="Reached" v={<span style={{ color: 'var(--ok)' }}>36 (75%)</span>} />
          <KV k="Plan accepted" v={<span style={{ color: 'var(--ok)' }}>24 (50%)</span>} />
          <KV k="Declined" v="7" />
          <KV k="Avg time to first contact" v="1.4 days" />
          <KV k="Cases closed" v="19" />
        </Card>
        <Card title="Upcoming Follow-ups">
          {[
            { n: 'Callback — salary verification', d: 'Today, 16:00', t: 'warn' },
            { n: 'Confirm EMI date change applied', d: 'Tomorrow, 10:30', t: 'accent' },
            { n: 'Review overdraft utilisation', d: '02 Oct', t: 'neutral' },
            { n: '30-day outcome check', d: '05 Oct', t: 'neutral' },
            { n: 'Branch appointment', d: '07 Oct, 11:00', t: 'accent' },
          ].map((f, i) => (
            <div key={i} className="row" style={{ padding: '7px 0', borderBottom: i < 4 ? '1px solid var(--line-soft)' : 'none' }}>
              <span className={`dot ${f.t === 'accent' ? 'neutral' : f.t}`} />
              <div>
                <div style={{ fontSize: 12 }}>{f.n}</div>
                <div className="tiny muted">{f.d}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
