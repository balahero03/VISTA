import { useState, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from 'recharts';
import {
  systemUsers, services, modelConfig, auditLog, ledger,
  portfolioTrend, computeHash,
} from '../data/mockData';
import { Card, Stat, Badge, KV, tip, axis } from '../components/ui';

const ROLE_TONE = {
  'Super Admin': 'critical', 'Risk Analyst': 'accent',
  'Intervention Manager': 'high', 'Relationship Manager': 'warn',
};

export default function SuperAdmin() {
  const [tab, setTab] = useState('ledger');
  const [cfg, setCfg] = useState(() => Object.fromEntries(modelConfig.map((m) => [m.key, m.value])));
  const [selTx, setSelTx] = useState(ledger[0].txId);
  const [tampered, setTampered] = useState({});
  const [userQ, setUserQ] = useState('');

  const entry = ledger.find((e) => e.txId === selTx) || ledger[0];

  // Verification recomputes the hash from the (possibly tampered) off-chain payload
  // and compares it against the value committed on-chain.
  const offChain = tampered[entry.txId]
    ? { ...entry.payload, riskScore: entry.payload.riskScore - 23 }
    : entry.payload;
  const recomputed = computeHash(offChain);
  const valid = recomputed === entry.hash;

  const users = useMemo(
    () => systemUsers.filter((u) => !userQ || `${u.name} ${u.role} ${u.email}`.toLowerCase().includes(userQ.toLowerCase())),
    [userQ],
  );

  const ledgerByDay = useMemo(() => {
    const m = {};
    ledger.forEach((e) => { const d = e.timestamp.slice(5, 10); m[d] = (m[d] || 0) + 1; });
    return Object.entries(m).sort().map(([label, count]) => ({ label, count }));
  }, []);

  return (
    <>
      <div className="grid g5 mb">
        <Stat label="Active Users" value={systemUsers.filter((u) => u.status === 'Active').length}
          foot={`${systemUsers.length} provisioned`} />
        <Stat label="Services Healthy" value={`${services.filter((s) => s.status === 'Healthy').length}/${services.length}`}
          tone={services.some((s) => s.status !== 'Healthy') ? 'warn' : 'ok'} foot="1 degraded" />
        <Stat label="Ledger Entries" value={ledger.length} foot="committed to Drunix" />
        <Stat label="Events Processed" value="1.24M" foot="last 24 hours" />
        <Stat label="Ledger Integrity" value={Object.keys(tampered).length ? 'Failed' : 'Verified'}
          tone={Object.keys(tampered).length ? 'critical' : 'ok'}
          foot={Object.keys(tampered).length ? 'mismatch detected' : 'all hashes match'} />
      </div>

      <div className="card mb">
        <div className="tabs">
          {[['ledger', 'Audit Ledger'], ['users', 'Users & Roles'],
            ['config', 'Model Configuration'], ['system', 'System Health'],
            ['activity', 'Activity Log']].map(([k, l]) => (
            <button key={k} className={`tab${tab === k ? ' on' : ''}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === 'ledger' && (
          <div className="card-body">
            <div className="tiny muted mb">
              Each material decision is written off-chain and its hash committed to the Drunix
              ledger. Sensitive customer data is never placed on-chain — only the record hash,
              an event reference, a timestamp and the lifecycle stage.
            </div>
            <div className="grid g-1-2" style={{ gap: 14 }}>
              <div className="card" style={{ background: 'var(--surface-2)' }}>
                <div className="card-head"><h3>Ledger Entries</h3>
                  <span className="hint">{ledger.length} transactions</span></div>
                <div className="table-wrap scroll-y" style={{ maxHeight: 440 }}>
                  <table className="table">
                    <thead><tr><th>Block</th><th>Case</th><th>Stage</th><th /></tr></thead>
                    <tbody>
                      {ledger.map((e) => (
                        <tr key={e.txId} className={`clickable${e.txId === selTx ? ' sel' : ''}`}
                          onClick={() => setSelTx(e.txId)}>
                          <td className="mono tiny muted">{e.block}</td>
                          <td className="mono tiny">{e.caseId}</td>
                          <td className="tiny">{e.stageLabel}</td>
                          <td>{tampered[e.txId]
                            ? <Badge tone="critical">✕</Badge>
                            : <Badge tone="ok">✓</Badge>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="col">
                <div className="card" style={{
                  border: `1px solid ${valid ? 'var(--ok-line)' : 'var(--critical-line)'}`,
                  background: valid ? 'var(--ok-bg)' : 'var(--critical-bg)',
                }}>
                  <div className="card-body">
                    <div className="row mb">
                      <span style={{ fontSize: 13, fontWeight: 600,
                        color: valid ? 'var(--ok)' : 'var(--critical)' }}>
                        {valid ? 'Integrity Verified' : 'Integrity Check Failed'}
                      </span>
                      <span className="spacer" />
                      <Badge tone={valid ? 'ok' : 'critical'}>
                        {valid ? 'Hash match' : 'Hash mismatch'}
                      </Badge>
                    </div>
                    <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text-2)' }}>
                      {valid
                        ? 'The hash recomputed from the off-chain record matches the value committed to the ledger. The record has not been altered since it was written.'
                        : 'The off-chain record no longer produces the hash committed to the ledger. The stored record has been modified after commitment. This is precisely the condition the audit layer exists to expose.'}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div className="stat-label">On-chain hash</div>
                      <div className="hash">{entry.hash}</div>
                      <div className="stat-label" style={{ marginTop: 9 }}>Recomputed from off-chain record</div>
                      <div className="hash" style={{ color: valid ? 'var(--ok)' : 'var(--critical)' }}>
                        {recomputed}
                      </div>
                    </div>
                    <div className="row" style={{ marginTop: 13 }}>
                      <button className="btn sm" onClick={() => setTampered({ ...tampered, [entry.txId]: !tampered[entry.txId] })}>
                        {tampered[entry.txId] ? 'Restore record' : 'Simulate tampering'}
                      </button>
                      <span className="tiny muted">Demonstration control</span>
                    </div>
                  </div>
                </div>

                <Card title="Transaction Detail">
                  <KV k="Transaction" v={<span className="mono tiny">{entry.txId.slice(0, 22)}…</span>} />
                  <KV k="Block" v={<span className="mono">{entry.block}</span>} />
                  <KV k="Timestamp" v={<span className="mono tiny">{entry.timestamp}</span>} />
                  <KV k="Stage" v={entry.stageLabel} />
                  <KV k="Actor" v={entry.actor} />
                  <KV k="Case" v={<span className="mono">{entry.caseId}</span>} />
                  <KV k="Gas" v={<span className="mono">{entry.gas.toLocaleString()}</span>} />
                  <div className="stat-label" style={{ marginTop: 11 }}>Previous hash</div>
                  <div className="hash">{entry.prevHash}</div>
                  <div className="stat-label" style={{ marginTop: 11 }}>Off-chain payload (hashed)</div>
                  <pre className="hash" style={{ background: 'var(--bg)', padding: 9,
                    borderRadius: 'var(--r)', border: '1px solid var(--line)', marginTop: 4,
                    color: tampered[entry.txId] ? 'var(--critical)' : 'var(--text-3)' }}>
{JSON.stringify(offChain, null, 2)}
                  </pre>
                </Card>
              </div>
            </div>

            <div className="grid g2" style={{ marginTop: 14 }}>
              <Card title="Decision Lifecycle" hint={`Case ${entry.caseId}`}>
                <div className="tl">
                  {['Risk Detected', 'Recommendation Generated', 'Human Approval',
                    'Intervention Executed', 'Outcome Recorded'].map((s) => {
                    const e = ledger.find((x) => x.caseId === entry.caseId && x.stageLabel === s);
                    return (
                      <div className="tl-item" key={s}>
                        <span className={`tl-dot${e ? ' done' : ''}`} />
                        <div className="row">
                          <div>
                            <div style={{ fontSize: 12.5, fontWeight: 550 }}>{s}</div>
                            <div className="tiny muted">
                              {e ? `${e.actor} · block ${e.block}` : 'Not yet recorded'}
                            </div>
                          </div>
                          <span className="spacer" />
                          {e && <span className="hash tiny">{e.hash.slice(0, 14)}…</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
              <Card title="Ledger Commits" hint="Transactions per day">
                <ResponsiveContainer width="100%" height={196}>
                  <BarChart data={ledgerByDay} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="label" {...axis} /><YAxis {...axis} />
                    {tip()}
                    <Bar dataKey="count" name="Commits" fill="#5d7f9e" fillOpacity={0.75} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="card-body">
            <div className="row mb">
              <input className="input" placeholder="Search users…" value={userQ}
                onChange={(e) => setUserQ(e.target.value)} style={{ maxWidth: 280 }} />
              <span className="spacer" />
              <button className="btn">Export</button>
              <button className="btn primary">Add User</button>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr><th>User</th><th>Role</th><th>Approval Limit</th><th>MFA</th>
                    <th>Status</th><th>Last Login</th><th /></tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div className="cust-cell">
                          <span className="avatar">{u.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
                          <div>
                            <div className="cust-name">{u.name}</div>
                            <div className="cust-id">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><Badge tone={ROLE_TONE[u.role]}>{u.role}</Badge></td>
                      <td className="mono tiny">{u.limit ? `₹${u.limit.toLocaleString('en-IN')}` : '—'}</td>
                      <td>{u.mfa ? <Badge tone="ok">Enabled</Badge> : <Badge tone="warn">Disabled</Badge>}</td>
                      <td><Badge tone={u.status === 'Active' ? 'ok' : 'neutral'}>{u.status}</Badge></td>
                      <td className="mono tiny muted">{u.lastLogin}</td>
                      <td><button className="btn sm ghost">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid g4" style={{ marginTop: 14, gap: 10 }}>
              {Object.keys(ROLE_TONE).map((r) => (
                <div className="card" key={r} style={{ padding: 12, background: 'var(--surface-2)' }}>
                  <div className="row" style={{ marginBottom: 5 }}>
                    <Badge tone={ROLE_TONE[r]}>{r}</Badge>
                    <span className="spacer" />
                    <span className="mono" style={{ fontWeight: 600 }}>
                      {systemUsers.filter((u) => u.role === r).length}
                    </span>
                  </div>
                  <div className="tiny muted">
                    {r === 'Super Admin' && 'Full configuration and audit access'}
                    {r === 'Risk Analyst' && 'Portfolio monitoring, read-only on decisions'}
                    {r === 'Intervention Manager' && 'Approves or rejects recommendations'}
                    {r === 'Relationship Manager' && 'Executes approved interventions'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'config' && (
          <div className="card-body">
            <div className="tiny muted mb">
              Detection parameters apply portfolio-wide. Changes are recorded in the activity
              log and take effect at the next scoring cycle.
            </div>
            <div className="grid g2" style={{ gap: 18 }}>
              <div>
                {modelConfig.map((m) => (
                  <div key={m.key} style={{ marginBottom: 17 }}>
                    <div className="row" style={{ marginBottom: 5 }}>
                      <label className="field-label" style={{ margin: 0 }}>{m.label}</label>
                      <span className="spacer" />
                      <span className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>
                        {cfg[m.key]} <span className="muted tiny">{m.unit}</span>
                      </span>
                    </div>
                    <input type="range" min={m.min} max={m.max} step={m.max > 50 ? 1 : 0.5}
                      value={cfg[m.key]} onChange={(e) => setCfg({ ...cfg, [m.key]: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: '#5d7f9e' }} />
                    <div className="tiny muted" style={{ marginTop: 3 }}>{m.help}</div>
                  </div>
                ))}
                <div className="row">
                  <button className="btn" onClick={() => setCfg(Object.fromEntries(modelConfig.map((m) => [m.key, m.value])))}>
                    Reset to defaults
                  </button>
                  <button className="btn primary">Apply Changes</button>
                </div>
              </div>
              <div className="col">
                <Card title="Projected Impact" hint="Estimated from current portfolio">
                  <KV k="Customers entering alert queue" v={
                    <span className="mono">{Math.max(0, Math.round((95 - cfg.alertThreshold) * 0.62))}</span>} />
                  <KV k="Velocity-triggered alerts" v={
                    <span className="mono">{Math.max(0, Math.round((21 - cfg.velocityThreshold) * 1.4))}</span>} />
                  <KV k="Estimated false positive rate" v={
                    <span className="mono">{Math.max(2, Math.round(42 - cfg.alertThreshold * 0.42))}%</span>} />
                  <KV k="Baseline coverage" v={
                    <span className="mono">{Math.min(99, Math.round(cfg.baselineWindow / 3.8))}%</span>} />
                  <div className="tiny muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
                    Lowering the alert threshold increases sensitivity but raises analyst
                    workload. The velocity threshold catches customers whose absolute score
                    remains acceptable.
                  </div>
                </Card>
                <Card title="Active Stress Classes">
                  {['Liquidity Pressure', 'Income Shock', 'Debt Pressure', 'Payment Stress',
                    'Spending Pressure', 'Compound Stress'].map((s) => (
                    <div className="row" key={s} style={{ padding: '6px 0', borderBottom: '1px solid var(--line-soft)' }}>
                      <span style={{ fontSize: 12 }}>{s}</span>
                      <span className="spacer" />
                      <Badge tone="ok">Enabled</Badge>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          </div>
        )}

        {tab === 'system' && (
          <div className="card-body">
            <div className="table-wrap mb">
              <table className="table">
                <thead><tr><th>Service</th><th>Status</th><th className="num">Latency</th>
                  <th className="num">Uptime</th><th className="num">Throughput</th></tr></thead>
                <tbody>
                  {services.map((s) => (
                    <tr key={s.name}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td><Badge tone={s.status === 'Healthy' ? 'ok' : 'warn'}>
                        <span className={`dot ${s.status === 'Healthy' ? 'ok' : 'warn'}`} />{s.status}</Badge></td>
                      <td className="num mono">{s.latency}</td>
                      <td className="num mono">{s.uptime}</td>
                      <td className="num mono muted">{s.throughput}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid g2">
              <Card title="Alerts and Interventions" hint="12 weeks">
                <ResponsiveContainer width="100%" height={186}>
                  <LineChart data={portfolioTrend} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="var(--grid)" strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="label" {...axis} interval={2} /><YAxis {...axis} />
                    {tip()}
                    <Line dataKey="interventions" name="Interventions" stroke="#5b9279" strokeWidth={1.7} dot={false} />
                    <Line dataKey="alerts" name="Alerts" stroke="#5d7f9e" strokeWidth={1.7} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
              <Card title="Infrastructure">
                <KV k="Kafka consumer lag" v={<span className="mono">312 messages</span>} />
                <KV k="PostgreSQL connections" v={<span className="mono">48 / 200</span>} />
                <KV k="MongoDB collections" v={<span className="mono">14</span>} />
                <KV k="Redis memory" v={<span className="mono">1.8 GB / 4 GB</span>} />
                <KV k="Drunix node sync" v={<Badge tone="ok">In sync — block 1842947</Badge>} />
                <KV k="Model version" v={<span className="mono">v2.4.1</span>} />
                <KV k="Last retrain" v="2026-09-24 02:00 UTC" />
              </Card>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div className="card-body">
            <div className="tiny muted mb">
              Complete record of privileged actions. This log is immutable and independently
              committed to the audit ledger.
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Target</th><th>Detail</th></tr></thead>
                <tbody>
                  {auditLog.map((a, i) => (
                    <tr key={i}>
                      <td className="mono tiny muted">{a.ts}</td>
                      <td>{a.actor}</td>
                      <td><Badge tone={
                        a.action.includes('REJECT') || a.action.includes('SUSPEND') ? 'critical'
                          : a.action.includes('APPROVE') ? 'ok'
                            : a.action.includes('UPDATE') ? 'warn' : 'neutral'
                      }>{a.action.replace(/_/g, ' ')}</Badge></td>
                      <td className="mono tiny">{a.target}</td>
                      <td className="muted">{a.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
