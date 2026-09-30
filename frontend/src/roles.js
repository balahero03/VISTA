import { cases, customers } from './data/mockData';

const pendingCount = cases.filter((c) => c.status === 'Pending Approval').length;
const alertCount = customers.filter((c) => c.score >= 55 || c.velocity > 6).length;
const rmCount = cases.filter((c) => c.assignedRm === 'S. Krishnan' && c.status !== 'Pending Approval').length;

export const ROLES = {
  admin: {
    key: 'admin',
    title: 'Super Admin',
    short: 'Admin',
    initials: 'BB',
    user: 'Balamuthukrishnan B',
    email: 'b.balamuthukrishnan@vista.internal',
    blurb: 'System configuration, user and role management, ledger verification',
    heading: 'System Administration',
    sub: 'Configuration, access control and audit ledger',
    nav: [
      { label: 'Audit Ledger', ico: '◈' },
      { label: 'Users & Roles', ico: '◉' },
      { label: 'Model Configuration', ico: '⚙' },
      { label: 'System Health', ico: '▤' },
      { label: 'Activity Log', ico: '☰' },
    ],
  },
  analyst: {
    key: 'analyst',
    title: 'Risk Analyst',
    short: 'Analyst',
    initials: 'RV',
    user: 'R. Venkatesh',
    email: 'r.venkatesh@vista.internal',
    blurb: 'Portfolio monitoring, alert investigation, signal validation',
    heading: 'Portfolio Risk Monitoring',
    sub: 'Stress trajectory across the monitored portfolio',
    nav: [
      { label: 'Portfolio Overview', ico: '◫' },
      { label: 'Alert Queue', ico: '⚑', count: alertCount },
      { label: 'Customer Detail', ico: '◐' },
      { label: 'Signal Explorer', ico: '∿' },
      { label: 'Event Stream', ico: '⇄' },
    ],
  },
  manager: {
    key: 'manager',
    title: 'Intervention Manager',
    short: 'Manager',
    initials: 'DR',
    user: 'D. Ramaswamy',
    email: 'd.ramaswamy@vista.internal',
    blurb: 'Reviews recommendations and approves, modifies or rejects them',
    heading: 'Intervention Review',
    sub: 'Human review of system recommendations before action',
    nav: [
      { label: 'Approval Queue', ico: '⚖', count: pendingCount },
      { label: 'Case Detail', ico: '▣' },
      { label: 'Communication', ico: '✉' },
      { label: 'Decision History', ico: '☰' },
    ],
  },
  rm: {
    key: 'rm',
    title: 'Relationship Manager',
    short: 'RM',
    initials: 'SK',
    user: 'S. Krishnan',
    email: 's.krishnan@vista.internal',
    blurb: 'Executes approved interventions and records customer outcomes',
    heading: 'Intervention Execution',
    sub: 'Approved actions assigned to you',
    nav: [
      { label: 'My Cases', ico: '▤', count: rmCount },
      { label: 'Approved Action', ico: '✓' },
      { label: 'Contact Log', ico: '☏' },
      { label: 'Outcomes', ico: '↗' },
    ],
  },
};
