# VISTA — Frontend Prototype

Role-based dashboard prototype for VISTA (Velocity-based Intelligence for Stress
Trajectory Analysis).

This is a **presentation prototype**. All data is synthetic and generated in the
browser from a seeded pseudo-random source in `src/data/mockData.js`. There is no
backend, no network call and no real customer data.

## Running

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```

## Roles

The prototype presents one dashboard per role. Sign in as any role from the login
screen, or use the role switcher in the top bar to move between them during a demo.

| Role | Responsibility | Scope |
|---|---|---|
| **Super Admin** | System configuration, user and role management, model thresholds, ledger verification | Everything, including audit tooling |
| **Risk Analyst** | Monitors the portfolio, investigates alerts, validates signals and SHAP attribution before escalating | Portfolio-wide; read-only on decisions |
| **Intervention Manager** | Reviews the recommendation and forecast, then approves, modifies or rejects | Escalated cases with full decision context |
| **Relationship Manager** | Executes the approved intervention, contacts the customer, records the outcome | Only their own assigned customers |

Approval and execution are held by **different roles** deliberately. Separating the
decision from the action is what gives the audit trail meaning — a single actor
approving and executing their own recommendation would record nothing worth verifying.

## Pages

**Risk Analyst** — portfolio KPIs; stress/velocity quadrant; stress distribution;
portfolio trend; filterable alert queue; customer detail with trajectory forecast,
per-signal baseline comparison, SHAP attribution and profile; live event stream;
signal breach frequency.

**Intervention Manager** — approval KPIs; case queue by status; decision panel with
recommendation, SHAP evidence, editable generative-AI communication draft and case
history timeline; decision bar with approve / approve-with-changes / reject and a
mandatory rationale on rejection; queue age, case mix and decision summary.

**Relationship Manager** — assigned case KPIs; my-cases list; approved action with
talking points; approved (locked) communication; contact log with channel and
outcome capture; before/after outcome chart against a no-intervention counterfactual;
portfolio health, contact effectiveness and follow-ups.

**Super Admin** — five tabs: Audit Ledger, Users & Roles, Model Configuration,
System Health, Activity Log.

## The audit ledger demonstration

On the Super Admin **Audit Ledger** tab, selecting an entry shows the hash committed
on-chain alongside the hash recomputed from the off-chain record. **Simulate
tampering** alters the off-chain payload; the recomputed hash then diverges and the
panel turns to a failed integrity check.

This is the point of the blockchain layer, and it is worth showing directly: the
ledger does not make the operational database immutable, it makes unauthorised
modification *detectable*.

## Suggested demo path

1. **Risk Analyst** — open on the quadrant. The top-left region holds customers whose
   score still looks acceptable but whose velocity is high. Two customers with the
   same score are not the same risk.
2. Select one of them. Walk the trajectory forecast, the breached signals against
   that customer's own baseline, then the SHAP attribution. Escalate.
3. **Intervention Manager** — review the recommendation and evidence, edit the
   generative-AI draft (the badge changes to *Modified by reviewer*), approve.
4. **Relationship Manager** — the approved action appears with talking points. Record
   a contact, then open Outcome to see the trajectory bend away from the
   no-intervention counterfactual.
5. **Super Admin** — Audit Ledger. Verify a hash, then simulate tampering and show the
   integrity check fail.

## Structure

```
src/
  data/mockData.js      seeded synthetic dataset — customers, cases, ledger, config
  components/ui.jsx     Card, Stat, Badge, KV, chart tooltip and axis defaults
  pages/                one file per role, plus Login
  roles.js              role definitions, navigation and badge counts
  styles.css            design tokens and all styling
```

## Design

Dark theme built on layered desaturated slate. Status colour is muted and carries
meaning only — green for stable, amber for warning, orange for elevated, red for
critical, and a single blue accent. No saturated or neon colour is used anywhere.
All colours are defined as tokens on `:root` in `styles.css`.

## Stack

React 19, Vite, Recharts. No CSS framework — plain CSS with custom properties.
