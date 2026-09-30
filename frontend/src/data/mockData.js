// Deterministic mock dataset for the VISTA prototype.
// Seeded pseudo-random generation keeps the demo identical across reloads.

let seed = 20260930;
function rand() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

export const STRESS_TYPES = {
  STABLE: { id: 'STABLE', label: 'Stable', tone: 'ok' },
  LIQUIDITY: { id: 'LIQUIDITY', label: 'Liquidity Pressure', tone: 'warn' },
  INCOME_SHOCK: { id: 'INCOME_SHOCK', label: 'Income Shock', tone: 'high' },
  DEBT: { id: 'DEBT', label: 'Debt Pressure', tone: 'high' },
  PAYMENT: { id: 'PAYMENT', label: 'Payment Stress', tone: 'warn' },
  SPENDING: { id: 'SPENDING', label: 'Spending Pressure', tone: 'warn' },
  COMPOUND: { id: 'COMPOUND', label: 'Compound Stress', tone: 'critical' },
};

export const SIGNALS = [
  { key: 'incomeStability', label: 'Income Stability', unit: 'idx' },
  { key: 'salaryTiming', label: 'Salary Timing', unit: 'days' },
  { key: 'liquidity', label: 'Liquidity Buffer', unit: 'days' },
  { key: 'creditUtilisation', label: 'Credit Utilisation', unit: '%' },
  { key: 'paymentTiming', label: 'Payment Timing', unit: 'days' },
  { key: 'failedDebits', label: 'Failed Auto-Debits', unit: 'count' },
  { key: 'spendingChange', label: 'Spending Change', unit: '%' },
];

const FIRST = ['Aarav', 'Diya', 'Rohan', 'Ananya', 'Vikram', 'Meera', 'Karthik', 'Sneha',
  'Arjun', 'Priya', 'Rahul', 'Nisha', 'Sanjay', 'Kavya', 'Imran', 'Fatima',
  'Joseph', 'Lakshmi', 'Manish', 'Divya', 'Suresh', 'Pooja', 'Naveen', 'Ritu',
  'Ganesh', 'Swathi', 'Ajay', 'Bhavna', 'Ravi', 'Tara'];
const LAST = ['Sharma', 'Iyer', 'Patel', 'Reddy', 'Nair', 'Gupta', 'Singh', 'Menon',
  'Desai', 'Rao', 'Khan', 'Joshi', 'Pillai', 'Varma', 'Bose'];

const SEGMENTS = ['Salaried', 'Self-Employed', 'Small Business'];
const BRANCHES = ['Chennai — Adyar', 'Bengaluru — Indiranagar', 'Mumbai — Andheri',
  'Hyderabad — Gachibowli', 'Pune — Kharadi', 'Delhi — Saket'];

export const RM_NAMES = ['S. Krishnan', 'A. Bhattacharya', 'M. Fernandes', 'R. Ahluwalia'];

function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function round(n, d = 1) { const f = 10 ** d; return Math.round(n * f) / f; }

// Build a 24-week score history that bends according to velocity/acceleration.
function buildHistory(endScore, velocity, acceleration) {
  const pts = [];
  const weeks = 24;
  for (let i = 0; i < weeks; i++) {
    const t = (i - (weeks - 1)) / 4; // weeks before now, in months
    const v = endScore + velocity * t + 0.5 * acceleration * t * t;
    pts.push({
      week: i - (weeks - 1),
      label: i === weeks - 1 ? 'Now' : `W${i - (weeks - 1)}`,
      score: Math.max(2, Math.min(98, round(v + (rand() - 0.5) * 2.4))),
    });
  }
  pts[pts.length - 1].score = endScore;
  return pts;
}

// Forecast cone: central projection plus widening confidence band.
function buildForecast(endScore, velocity, acceleration) {
  const pts = [];
  for (let i = 1; i <= 8; i++) {
    const t = i / 4;
    const central = endScore + velocity * t + 0.5 * acceleration * t * t;
    const spread = 3 + i * 1.6;
    pts.push({
      week: i,
      label: `+${i}w`,
      forecast: round(Math.max(2, Math.min(98, central))),
      lower: round(Math.max(2, Math.min(98, central - spread))),
      upper: round(Math.max(2, Math.min(98, central + spread))),
    });
  }
  return pts;
}

function classify(score, velocity, drivers) {
  // Low score with no meaningful deviation is simply a stable customer.
  if (score < 38 && drivers.length <= 1) return STRESS_TYPES.STABLE;
  if (score > 68 && drivers.length >= 4) return STRESS_TYPES.COMPOUND;

  // Rank the dominant driver rather than matching in fixed order, so the
  // classification reflects which signal deviated most.
  const weight = {
    incomeStability: drivers.includes('incomeStability') ? 3 : 0,
    salaryTiming: drivers.includes('salaryTiming') ? 2 : 0,
    creditUtilisation: drivers.includes('creditUtilisation') ? 3 : 0,
    liquidity: drivers.includes('liquidity') ? 3 : 0,
    failedDebits: drivers.includes('failedDebits') ? 2 : 0,
    paymentTiming: drivers.includes('paymentTiming') ? 1 : 0,
    spendingChange: drivers.includes('spendingChange') ? 2 : 0,
  };
  const income = weight.incomeStability + weight.salaryTiming;
  const payment = weight.failedDebits + weight.paymentTiming;
  const ranked = [
    ['INCOME_SHOCK', income],
    ['DEBT', weight.creditUtilisation],
    ['LIQUIDITY', weight.liquidity],
    ['PAYMENT', payment],
    ['SPENDING', weight.spendingChange],
  ].sort((a, b) => b[1] - a[1]);

  if (ranked[0][1] === 0) return score < 40 ? STRESS_TYPES.STABLE : STRESS_TYPES.LIQUIDITY;
  return STRESS_TYPES[ranked[0][0]];
}

function buildSignals(score, velocity) {
  const stress = score / 100;
  const base = {
    incomeStability: { value: round(92 - stress * 46 + (rand() - 0.5) * 8), baseline: 90, better: 'high' },
    salaryTiming: { value: round(stress * 9 + (rand() - 0.5) * 1.5), baseline: 0.5, better: 'low' },
    liquidity: { value: round(48 - stress * 41 + (rand() - 0.5) * 6), baseline: 45, better: 'high' },
    creditUtilisation: { value: round(22 + stress * 62 + (rand() - 0.5) * 9), baseline: 28, better: 'low' },
    paymentTiming: { value: round(stress * 7 + (rand() - 0.5) * 1.2), baseline: 0.3, better: 'low' },
    failedDebits: { value: Math.max(0, Math.round(stress * 4 + (rand() - 0.6))), baseline: 0, better: 'low' },
    spendingChange: { value: round(stress * 34 - 6 + (rand() - 0.5) * 10), baseline: 2, better: 'low' },
  };
  Object.keys(base).forEach((k) => {
    const s = base[k];
    s.value = Math.max(0, s.value);
    const dev = s.baseline === 0 ? s.value : (s.value - s.baseline) / Math.abs(s.baseline);
    s.deviation = round(dev * 100, 0);
    s.breach = s.better === 'high' ? s.deviation < -26 : s.deviation > 55;
    s.velocity = round((s.better === 'high' ? -1 : 1) * velocity * (0.6 + rand() * 0.9), 2);
    s.history = Array.from({ length: 12 }, (_, i) => ({
      i,
      v: round(s.value - s.velocity * (11 - i) * 0.35 + (rand() - 0.5) * 2.2),
    }));
  });
  return base;
}

const RECOMMENDATIONS = {
  LIQUIDITY: { action: 'Short-term liquidity support', detail: 'Offer a 60-day overdraft facility of ₹40,000 with waived processing, plus an optional EMI date realignment to follow the revised salary credit date.' },
  INCOME_SHOCK: { action: 'EMI restructuring review', detail: 'Initiate a three-month step-down EMI plan and schedule an income verification call to establish whether the salary disruption is temporary or structural.' },
  DEBT: { action: 'Debt consolidation offer', detail: 'Consolidate revolving credit card balances into a 24-month personal loan at a reduced rate to lower the monthly servicing burden.' },
  PAYMENT: { action: 'Auto-debit date realignment', detail: 'Reschedule recurring mandates to three days after observed salary credit and enable a low-balance pre-debit alert.' },
  SPENDING: { action: 'Budget advisory outreach', detail: 'Assign a financial wellness advisory session and enable category-level spending alerts within the mobile application.' },
  COMPOUND: { action: 'Priority relationship review', detail: 'Escalate for a full relationship review covering restructuring, liquidity support and consolidated repayment planning. Assign senior relationship manager.' },
  STABLE: { action: 'Monitor only', detail: 'No intervention required. Continue passive monitoring at standard cadence.' },
};

const DRAFTS = {
  LIQUIDITY: `Dear {name},\n\nWe noticed your account balance has been running lower than usual over recent weeks, and we wanted to reach out before it becomes an inconvenience.\n\nAs a valued customer, you are eligible for a short-term overdraft facility of up to ₹40,000 for 60 days, with the processing fee waived. We can also move your EMI date to better align with when your salary is credited.\n\nIf this would be helpful, simply reply to this message or call your relationship manager on the number below.\n\nWarm regards,\n{rm}\nRelationship Manager`,
  INCOME_SHOCK: `Dear {name},\n\nWe observed a change in the pattern of your incoming salary credits and wanted to check in.\n\nIf you are experiencing a temporary change in income, we can help. You may be eligible for a three-month reduced-EMI arrangement, which lowers your monthly outgo without affecting your credit standing.\n\nWe would welcome a short call at a time convenient to you.\n\nWarm regards,\n{rm}\nRelationship Manager`,
  DEBT: `Dear {name},\n\nWe noticed your credit card utilisation has increased over the past few months.\n\nYou may be able to reduce your monthly outgo by consolidating your outstanding balances into a single personal loan at a lower rate of interest, repayable over 24 months.\n\nWe would be glad to walk you through the numbers.\n\nWarm regards,\n{rm}\nRelationship Manager`,
  PAYMENT: `Dear {name},\n\nA few of your recent auto-debit instructions were presented at a time when your balance was low.\n\nWe can reschedule these to a date shortly after your salary is credited, and set up an alert to notify you in advance if your balance is likely to fall short. There is no charge for this.\n\nWarm regards,\n{rm}\nRelationship Manager`,
  SPENDING: `Dear {name},\n\nYour recent spending pattern differs noticeably from your usual pattern, and we wanted to make sure everything is in order.\n\nWe offer a complimentary financial wellness session and can enable category-level spending alerts in your mobile app.\n\nWarm regards,\n{rm}\nRelationship Manager`,
  COMPOUND: `Dear {name},\n\nWe would like to arrange a review of your accounts at your earliest convenience.\n\nWe have a number of options available that may help ease your current monthly commitments, and we would prefer to discuss these with you directly rather than by message.\n\nPlease let us know a suitable time and a senior relationship manager will call you.\n\nWarm regards,\n{rm}\nRelationship Manager`,
  STABLE: `Dear {name},\n\nThis is a routine check-in. No action is required.\n\nWarm regards,\n{rm}`,
};

function makeCustomer(i) {
  const id = `C${1000 + i}`;
  const name = `${pick(FIRST)} ${pick(LAST)}`;
  const r = rand();

  // Distribution: mostly stable, a meaningful tail under pressure.
  let score, velocity, acceleration;
  if (r < 0.42) { score = 8 + rand() * 22; velocity = -2 + rand() * 4; acceleration = -1 + rand() * 2; }
  else if (r < 0.68) { score = 30 + rand() * 20; velocity = 1 + rand() * 6; acceleration = -0.5 + rand() * 2; }
  else if (r < 0.87) { score = 48 + rand() * 22; velocity = 4 + rand() * 9; acceleration = rand() * 3.5; }
  else { score = 66 + rand() * 28; velocity = 7 + rand() * 13; acceleration = 1 + rand() * 5; }

  score = round(score); velocity = round(velocity, 1); acceleration = round(acceleration, 1);
  const signals = buildSignals(score, velocity);
  const drivers = Object.keys(signals).filter((k) => signals[k].breach);
  const stress = classify(score, velocity, drivers);

  const history = buildHistory(score, velocity, acceleration);
  const forecast = buildForecast(score, velocity, acceleration);
  const projected = forecast[forecast.length - 1].forecast;

  // Weeks until the projected trajectory crosses the 75 alert threshold.
  let weeksToThreshold = null;
  if (score < 75) {
    const hit = forecast.find((f) => f.forecast >= 75);
    weeksToThreshold = hit ? hit.week : null;
  }

  // SHAP-style attributions summing toward the score.
  const contribs = Object.keys(signals).map((k) => {
    const s = signals[k];
    const mag = Math.abs(s.deviation) / 100;
    const dir = s.breach ? 1 : -1;
    return { key: k, label: SIGNALS.find((x) => x.key === k).label, value: round(dir * mag * (8 + rand() * 14), 1) };
  }).sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const rec = RECOMMENDATIONS[stress.id];
  const rm = pick(RM_NAMES);

  return {
    id, name,
    segment: pick(SEGMENTS),
    branch: pick(BRANCHES),
    rm,
    since: 2014 + Math.floor(rand() * 10),
    exposure: Math.round((2 + rand() * 46)) * 100000,
    score, velocity, acceleration, projected, weeksToThreshold,
    stress, signals, drivers, history, forecast, contribs,
    confidence: round(72 + rand() * 25),
    recommendation: rec,
    draft: DRAFTS[stress.id],
    lastEvent: `${Math.floor(rand() * 58) + 1} min ago`,
  };
}

export const customers = Array.from({ length: 64 }, (_, i) => makeCustomer(i))
  .sort((a, b) => b.velocity - a.velocity);

export const portfolio = {
  total: customers.length,
  monitored: customers.length,
  byStress: Object.values(STRESS_TYPES).map((t) => ({
    ...t, count: customers.filter((c) => c.stress.id === t.id).length,
  })).filter((t) => t.count > 0),
  accelerating: customers.filter((c) => c.acceleration > 1.5).length,
  deteriorating: customers.filter((c) => c.velocity > 3).length,
  improving: customers.filter((c) => c.velocity < -1).length,
  highRisk: customers.filter((c) => c.score >= 70).length,
  // The thesis case: still looks healthy, but moving fast.
  hiddenRisk: customers.filter((c) => c.score < 50 && c.velocity > 6).length,
  exposureAtRisk: customers.filter((c) => c.score >= 55).reduce((s, c) => s + c.exposure, 0),
};

export const portfolioTrend = Array.from({ length: 12 }, (_, i) => ({
  label: `W-${11 - i}`,
  avgScore: round(34 + i * 0.8 + (rand() - 0.5) * 3),
  alerts: Math.round(8 + i * 1.1 + rand() * 5),
  interventions: Math.round(4 + i * 0.7 + rand() * 3),
}));

const CASE_STATUS = ['Pending Approval', 'Approved', 'Executing', 'Completed', 'Rejected'];

export const cases = customers
  .filter((c) => c.score >= 45)
  .slice(0, 26)
  .map((c, i) => {
    const status = i < 6 ? 'Pending Approval'
      : i < 10 ? 'Approved'
        : i < 15 ? 'Executing'
          : i < 23 ? 'Completed' : 'Rejected';
    const improvement = status === 'Completed' ? round(-4 - rand() * 26) : null;
    return {
      caseId: `INT-${4200 + i}`,
      customerId: c.id,
      customer: c,
      raisedBy: 'R. Venkatesh (Risk Analyst)',
      raisedAt: `2026-09-${String(10 + (i % 18)).padStart(2, '0')} ${String(9 + (i % 8)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
      status,
      priority: c.score >= 72 ? 'High' : c.score >= 58 ? 'Medium' : 'Low',
      approver: status === 'Pending Approval' ? null : 'D. Ramaswamy (Intervention Manager)',
      assignedRm: c.rm,
      improvement,
      outcomeNote: status === 'Completed'
        ? (improvement < -12 ? 'Trajectory reversed. Customer stabilised.' : 'Partial improvement. Continue monitoring.')
        : null,
    };
  });

export const CASE_STATUSES = CASE_STATUS;

// Ledger entries for the audit trail, chained by previous-hash.
function hashOf(s) {
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < s.length; i++) {
    h1 ^= s.charCodeAt(i); h1 = Math.imul(h1, 0x01000193);
    h2 = Math.imul(h2 ^ s.charCodeAt(i), 0x85ebca6b);
  }
  const a = (h1 >>> 0).toString(16).padStart(8, '0');
  const b = (h2 >>> 0).toString(16).padStart(8, '0');
  return `0x${a}${b}${a.split('').reverse().join('')}${b.split('').reverse().join('')}`;
}

export function computeHash(payload) {
  return hashOf(JSON.stringify(payload));
}

const LIFECYCLE = [
  { stage: 'RISK_DETECTED', label: 'Risk Detected', actor: 'VISTA Engine' },
  { stage: 'RECOMMENDATION', label: 'Recommendation Generated', actor: 'VISTA Engine' },
  { stage: 'HUMAN_APPROVAL', label: 'Human Approval', actor: 'D. Ramaswamy' },
  { stage: 'INTERVENTION', label: 'Intervention Executed', actor: null },
  { stage: 'OUTCOME', label: 'Outcome Recorded', actor: 'VISTA Engine' },
];

export const ledger = cases.slice(0, 14).flatMap((c, ci) => {
  const depth = c.status === 'Completed' ? 5
    : c.status === 'Executing' ? 4
      : c.status === 'Approved' ? 3
        : c.status === 'Rejected' ? 3 : 2;
  let prev = '0x' + '0'.repeat(32);
  return LIFECYCLE.slice(0, depth).map((st, si) => {
    const payload = {
      caseId: c.caseId,
      customerRef: computeHash({ id: c.customerId }).slice(0, 18),
      stage: st.stage,
      stressType: c.customer.stress.id,
      riskScore: c.customer.score,
      velocity: c.customer.velocity,
      actor: st.actor || c.assignedRm,
      sequence: si,
    };
    const hash = computeHash(payload);
    const entry = {
      txId: `0x${(0xd7a1 + ci * 97 + si * 13).toString(16)}${computeHash(payload).slice(4, 22)}`,
      block: 1842900 + ci * 11 + si,
      caseId: c.caseId,
      customerId: c.customerId,
      stage: st.stage,
      stageLabel: st.label,
      actor: st.actor || c.assignedRm,
      timestamp: `2026-09-${String(12 + (ci % 16)).padStart(2, '0')}T${String(9 + si).padStart(2, '0')}:${String((ci * 11 + si * 7) % 60).padStart(2, '0')}:${String((ci * 3) % 60).padStart(2, '0')}Z`,
      payload,
      hash,
      prevHash: prev,
      gas: 21000 + Math.round(rand() * 8000),
    };
    prev = hash;
    return entry;
  });
});

export const systemUsers = [
  { id: 'U-001', name: 'Balamuthukrishnan B', email: 'b.balamuthukrishnan@vista.internal', role: 'Super Admin', status: 'Active', mfa: true, lastLogin: '2026-09-30 09:12', limit: null },
  { id: 'U-002', name: 'R. Venkatesh', email: 'r.venkatesh@vista.internal', role: 'Risk Analyst', status: 'Active', mfa: true, lastLogin: '2026-09-30 08:47', limit: null },
  { id: 'U-003', name: 'D. Ramaswamy', email: 'd.ramaswamy@vista.internal', role: 'Intervention Manager', status: 'Active', mfa: true, lastLogin: '2026-09-30 09:03', limit: 500000 },
  { id: 'U-004', name: 'S. Krishnan', email: 's.krishnan@vista.internal', role: 'Relationship Manager', status: 'Active', mfa: true, lastLogin: '2026-09-30 08:21', limit: 100000 },
  { id: 'U-005', name: 'A. Bhattacharya', email: 'a.bhattacharya@vista.internal', role: 'Relationship Manager', status: 'Active', mfa: false, lastLogin: '2026-09-29 17:55', limit: 100000 },
  { id: 'U-006', name: 'M. Fernandes', email: 'm.fernandes@vista.internal', role: 'Relationship Manager', status: 'Active', mfa: true, lastLogin: '2026-09-30 07:40', limit: 100000 },
  { id: 'U-007', name: 'R. Ahluwalia', email: 'r.ahluwalia@vista.internal', role: 'Relationship Manager', status: 'Suspended', mfa: true, lastLogin: '2026-09-24 11:02', limit: 100000 },
  { id: 'U-008', name: 'P. Iyengar', email: 'p.iyengar@vista.internal', role: 'Risk Analyst', status: 'Active', mfa: true, lastLogin: '2026-09-30 08:58', limit: null },
  { id: 'U-009', name: 'N. Chatterjee', email: 'n.chatterjee@vista.internal', role: 'Intervention Manager', status: 'Active', mfa: true, lastLogin: '2026-09-29 16:30', limit: 250000 },
];

export const services = [
  { name: 'Ingestion — Kafka Consumer', status: 'Healthy', latency: '38 ms', uptime: '99.98%', throughput: '1,240 ev/s' },
  { name: 'Baseline Engine', status: 'Healthy', latency: '112 ms', uptime: '99.95%', throughput: '480 req/m' },
  { name: 'Signal Processor', status: 'Healthy', latency: '86 ms', uptime: '99.97%', throughput: '920 req/m' },
  { name: 'Velocity Engine', status: 'Healthy', latency: '54 ms', uptime: '99.99%', throughput: '1,100 req/m' },
  { name: 'Classification Model', status: 'Degraded', latency: '486 ms', uptime: '99.41%', throughput: '310 req/m' },
  { name: 'Forecast Service', status: 'Healthy', latency: '204 ms', uptime: '99.92%', throughput: '260 req/m' },
  { name: 'SHAP Explainer', status: 'Healthy', latency: '318 ms', uptime: '99.88%', throughput: '190 req/m' },
  { name: 'GenAI Draft Service', status: 'Healthy', latency: '1.4 s', uptime: '99.81%', throughput: '42 req/m' },
  { name: 'Drunix Ledger Writer', status: 'Healthy', latency: '620 ms', uptime: '99.94%', throughput: '18 tx/m' },
];

export const modelConfig = [
  { key: 'alertThreshold', label: 'Alert Threshold', value: 75, min: 40, max: 95, unit: 'score', help: 'Composite stress score at which a customer enters the alert queue.' },
  { key: 'velocityThreshold', label: 'Velocity Threshold', value: 6, min: 1, max: 20, unit: 'pts/mo', help: 'Rate of deterioration that triggers an alert regardless of absolute score.' },
  { key: 'accelThreshold', label: 'Acceleration Threshold', value: 2.5, min: 0.5, max: 10, unit: 'pts/mo²', help: 'Escalates cases where deterioration is itself speeding up.' },
  { key: 'baselineWindow', label: 'Baseline Window', value: 180, min: 60, max: 365, unit: 'days', help: 'Historical period used to establish each customer\'s personal baseline.' },
  { key: 'minObservations', label: 'Minimum Observations', value: 45, min: 20, max: 120, unit: 'events', help: 'Events required before a baseline is considered reliable.' },
  { key: 'forecastHorizon', label: 'Forecast Horizon', value: 8, min: 2, max: 26, unit: 'weeks', help: 'Length of the projected trajectory shown to analysts.' },
];

export const auditLog = [
  { ts: '2026-09-30 09:14:22', actor: 'D. Ramaswamy', action: 'APPROVE_INTERVENTION', target: 'INT-4203', detail: 'Approved with modified communication' },
  { ts: '2026-09-30 09:02:41', actor: 'R. Venkatesh', action: 'ESCALATE_CASE', target: 'INT-4206', detail: 'Escalated — compound stress confirmed' },
  { ts: '2026-09-30 08:51:07', actor: 'Balamuthukrishnan B', action: 'UPDATE_THRESHOLD', target: 'velocityThreshold', detail: 'Changed 7 → 6 pts/mo' },
  { ts: '2026-09-30 08:33:19', actor: 'S. Krishnan', action: 'LOG_OUTCOME', target: 'INT-4214', detail: 'Customer contacted, plan accepted' },
  { ts: '2026-09-30 08:12:55', actor: 'System', action: 'LEDGER_COMMIT', target: 'INT-4203', detail: 'Committed to Drunix — block 1842911' },
  { ts: '2026-09-29 17:58:02', actor: 'Balamuthukrishnan B', action: 'SUSPEND_USER', target: 'U-007', detail: 'Suspended pending access review' },
  { ts: '2026-09-29 16:44:30', actor: 'N. Chatterjee', action: 'REJECT_INTERVENTION', target: 'INT-4222', detail: 'Rejected — insufficient signal persistence' },
  { ts: '2026-09-29 15:20:11', actor: 'P. Iyengar', action: 'VIEW_CUSTOMER', target: 'C1041', detail: 'Opened trajectory detail' },
];

export const eventStream = [
  { ts: '09:41:12', type: 'SALARY_CREDIT', customer: 'C1017', detail: '₹78,400 credited — 4 days later than baseline' },
  { ts: '09:40:58', type: 'AUTO_DEBIT_FAIL', customer: 'C1033', detail: 'Mandate ₹12,500 failed — insufficient balance' },
  { ts: '09:40:31', type: 'CREDIT_UTILISATION', customer: 'C1008', detail: 'Utilisation crossed 82% (baseline 34%)' },
  { ts: '09:39:47', type: 'BALANCE_DRAWDOWN', customer: 'C1052', detail: 'Liquidity buffer fell to 6 days' },
  { ts: '09:39:02', type: 'EMI_PAYMENT', customer: 'C1024', detail: '₹22,000 paid on time' },
  { ts: '09:38:20', type: 'SPEND_SPIKE', customer: 'C1011', detail: 'Medical category +340% against baseline' },
  { ts: '09:37:55', type: 'SALARY_CREDIT', customer: 'C1046', detail: '₹54,000 credited on schedule' },
  { ts: '09:37:14', type: 'AUTO_DEBIT_FAIL', customer: 'C1029', detail: 'Mandate ₹8,200 failed — second occurrence' },
];

export function inr(n) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
}
