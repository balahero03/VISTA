import { useState } from 'react';
import { ROLES } from './roles';
import Login from './pages/Login';
import RiskAnalyst from './pages/RiskAnalyst';
import InterventionManager from './pages/InterventionManager';
import RelationshipManager from './pages/RelationshipManager';
import SuperAdmin from './pages/SuperAdmin';

const PAGES = {
  analyst: RiskAnalyst,
  manager: InterventionManager,
  rm: RelationshipManager,
  admin: SuperAdmin,
};

export default function App() {
  const [role, setRole] = useState(null);
  const [navIdx, setNavIdx] = useState(0);

  if (!role) return <Login onLogin={(r) => { setRole(r); setNavIdx(0); }} />;

  const r = ROLES[role];
  const Page = PAGES[role];

  function switchRole(k) { setRole(k); setNavIdx(0); }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">V</span>
          <div style={{ minWidth: 0 }}>
            <div className="brand-name">VISTA</div>
            <div className="brand-sub">Trajectory Analysis</div>
          </div>
        </div>

        <nav className="nav">
          <div className="nav-label">{r.title}</div>
          {r.nav.map((n, i) => (
            <button key={n.label} className={`nav-item${i === navIdx ? ' active' : ''}`}
              onClick={() => setNavIdx(i)}>
              <span className="ico">{n.ico}</span>
              <span>{n.label}</span>
              {n.count !== undefined && <span className="count">{n.count}</span>}
            </button>
          ))}

          <div className="nav-label">Reference</div>
          <button className="nav-item"><span className="ico">◇</span><span>Stress Classes</span></button>
          <button className="nav-item"><span className="ico">?</span><span>Methodology</span></button>
        </nav>

        <div className="sidebar-foot">
          <div className="role-card">
            <div className="role-card-top">
              <span className="avatar">{r.initials}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="role-card-name">{r.user}</div>
                <div className="role-card-role">{r.title}</div>
              </div>
            </div>
            <button className="btn sm ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={() => setRole(null)}>Sign out</button>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <h1>{r.heading}</h1>
          </div>
          <span className="sub">{r.sub}</span>
          <div className="topbar-right">
            <span className="tiny muted">Demo · switch role</span>
            <div className="role-switch">
              {Object.values(ROLES).map((x) => (
                <button key={x.key} className={x.key === role ? 'on' : ''}
                  onClick={() => switchRole(x.key)}>{x.short}</button>
              ))}
            </div>
          </div>
        </header>

        <main className="content">
          <div className="content-inner">
            <Page />
          </div>
        </main>
      </div>
    </div>
  );
}
