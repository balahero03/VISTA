import { useState } from 'react';
import { ROLES } from '../roles';

export default function Login({ onLogin }) {
  const [role, setRole] = useState('analyst');

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="row" style={{ justifyContent: 'center', gap: 10, marginBottom: 6 }}>
          <span className="brand-mark" style={{ width: 30, height: 30, fontSize: 13 }}>V</span>
          <div>
            <div style={{ fontSize: 17, fontWeight: 650, letterSpacing: '-0.2px' }}>VISTA</div>
            <div className="brand-sub">Stress Trajectory Analysis</div>
          </div>
        </div>
        <div className="center tiny muted" style={{ marginBottom: 20 }}>
          Velocity-based Intelligence for Stress Trajectory Analysis
        </div>

        <div className="card">
          <div className="card-body">
            <div className="field-label">Sign in as</div>
            {Object.entries(ROLES).map(([k, r]) => (
              <button key={k} className={`login-role${role === k ? ' on' : ''}`}
                onClick={() => setRole(k)}>
                <span className="avatar">{r.initials}</span>
                <div style={{ minWidth: 0 }}>
                  <div className="login-role-name">{r.title}</div>
                  <div className="login-role-desc">{r.blurb}</div>
                </div>
              </button>
            ))}

            <div style={{ marginTop: 14 }}>
              <label className="field-label">Email</label>
              <input className="input" value={ROLES[role].email} readOnly />
            </div>
            <div style={{ marginTop: 10 }}>
              <label className="field-label">Password</label>
              <input className="input" type="password" defaultValue="demo-access" />
            </div>

            <button className="btn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 16, padding: '8px 12px' }}
              onClick={() => onLogin(role)}>
              Sign in
            </button>

            <div className="center tiny muted" style={{ marginTop: 12, lineHeight: 1.6 }}>
              Prototype environment · synthetic data only
            </div>
          </div>
        </div>

        <div className="center tiny" style={{ marginTop: 14, color: 'var(--text-4)' }}>
          Access is governed by role-based permissions. All privileged actions are recorded.
        </div>
      </div>
    </div>
  );
}
