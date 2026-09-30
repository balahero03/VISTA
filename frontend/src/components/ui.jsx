import { Tooltip } from 'recharts';

export function Card({ title, hint, right, children, flush, style, className = '' }) {
  return (
    <div className={`card ${className}`} style={style}>
      {(title || right) && (
        <div className="card-head">
          {title && <h3>{title}</h3>}
          {hint && <span className="hint">{hint}</span>}
          {right && <div className="card-head-right">{right}</div>}
        </div>
      )}
      <div className={`card-body${flush ? ' flush' : ''}`}>{children}</div>
    </div>
  );
}

export function Stat({ label, value, foot, tone, delta, deltaDir }) {
  return (
    <div className="card stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={tone ? { color: `var(--${tone})` } : undefined}>{value}</div>
      {(foot || delta) && (
        <div className="stat-foot">
          {delta && <span className={`delta ${deltaDir || 'flat'}`}>{delta}</span>}
          {foot && <span>{foot}</span>}
        </div>
      )}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function Dot({ tone = 'neutral' }) { return <span className={`dot ${tone}`} />; }

export function KV({ k, v }) {
  return <div className="kv"><span className="kv-k">{k}</span><span className="kv-v">{v}</span></div>;
}

/** Shared dark tooltip for every Recharts surface. */
export function ChartTip({ active, payload, label, fmt }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rc-tip">
      {label !== undefined && <div className="rc-tip-label">{label}</div>}
      {payload.map((p, i) => (
        <div className="rc-tip-row" key={i}>
          <span className="dot" style={{ background: p.color || p.stroke }} />
          <span className="rc-tip-key">{p.name}</span>
          <span className="rc-tip-val">{fmt ? fmt(p.value, p) : p.value}</span>
        </div>
      ))}
    </div>
  );
}

export const tip = (fmt) => <Tooltip content={<ChartTip fmt={fmt} />} cursor={{ stroke: '#33404f', strokeWidth: 1 }} />;

export const axis = {
  stroke: '#33404f',
  tick: { fill: '#6b7888', fontSize: 10.5 },
  tickLine: false,
  axisLine: { stroke: '#262f3b' },
};

export function scoreTone(s) {
  if (s >= 70) return 'critical';
  if (s >= 55) return 'high';
  if (s >= 38) return 'warn';
  return 'ok';
}

export function velTone(v) {
  if (v > 6) return 'critical';
  if (v > 3) return 'high';
  if (v > 1) return 'warn';
  if (v < -1) return 'ok';
  return 'neutral';
}

export function Arrow({ v }) {
  if (v > 0.5) return <span style={{ color: 'var(--critical)' }}>▲</span>;
  if (v < -0.5) return <span style={{ color: 'var(--ok)' }}>▼</span>;
  return <span style={{ color: 'var(--text-4)' }}>—</span>;
}

export function Prog({ value, max = 100, tone = 'accent' }) {
  return (
    <div className="prog">
      <div className="prog-fill" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: `var(--${tone})` }} />
    </div>
  );
}
