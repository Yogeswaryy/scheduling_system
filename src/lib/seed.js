// Deterministic demo data (same every reset). Replace with API calls later.
import { BASE_EMPLOYEES, HOLIDAYS, LEAVE_TYPES, MANAGER, MAX_OFF, ENTITLEMENT, typeById } from './constants';
import { leaveDates } from './calc';
import { addDays, isWeekend, rangeDates, TODAY } from './dates';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const compact = (d) => d.replace(/-/g, '');

export function seedState() {
  const rand = rng(20261006);
  const pick = (n) => Math.floor(rand() * n);
  let seq = 100;
  const requests = [];

  const add = ({ employeeId, typeId, start, end, status = 'approved', submittedAt, attachment, reason }) => {
    const type = typeById(typeId);
    const dates = leaveDates(start, end, type, HOLIDAYS);
    if (!dates.length) return null;
    const sub = submittedAt || `${addDays(start, -(3 + pick(10)))}T${String(9 + pick(8)).padStart(2, '0')}:${String(10 + pick(49))}:00`;
    const decideAt = `${addDays(sub.slice(0, 10), 1)}T11:${String(10 + pick(49))}:00`;
    const history = [{ action: 'Submitted', at: sub, by: employeeId }];
    if (status === 'approved') history.push({ action: 'Approved', at: decideAt, by: employeeId === MANAGER.id ? 'HR' : MANAGER.id });
    if (status === 'rejected') history.push({ action: 'Rejected', at: decideAt, by: employeeId === MANAGER.id ? 'HR' : MANAGER.id });
    if (status === 'cancelled') history.push({ action: 'Cancelled', at: decideAt, by: employeeId });
    seq += 1;
    const req = {
      id: `LR-${compact(sub.slice(0, 10))}-${String(seq).padStart(3, '0')}`,
      employeeId,
      typeId,
      start,
      end,
      dates,
      status,
      submittedAt: sub,
      history,
      attachment: attachment || (type.requiresAttachment ? 'medical-certificate.pdf' : null),
      reason: reason || '',
    };
    requests.push(req);
    return req;
  };

  /* ---- explicit scenario data (matches the wireframes) ---- */
  const E = {};
  BASE_EMPLOYEES.forEach((e) => (E[e.name.split(' ')[0]] = e.id));

  const explicit = [
    // this week
    { e: 'Ethan', t: 'annual', s: '2026-10-07', f: '2026-10-09' },
    { e: 'Priya', t: 'annual', s: '2026-10-07', f: '2026-10-07' },
    { e: 'Arjit', t: 'annual', s: '2026-10-07', f: '2026-10-07' },
    { e: 'Jason', t: 'unpaid', s: '2026-10-06', f: '2026-10-07' },
    { e: 'Kumar', t: 'sick', s: '2026-10-08', f: '2026-10-09' },
    { e: 'Amanda', t: 'annual', s: '2026-10-01', f: '2026-10-02' },
    // next weeks
    { e: 'Mia', t: 'sick', s: '2026-10-12', f: '2026-10-13' },
    { e: 'Priya', t: 'sick', s: '2026-10-13', f: '2026-10-13' },
    { e: 'Arjit', t: 'annual', s: '2026-10-13', f: '2026-10-13' },
    { e: 'Sarah', t: 'maternity', s: '2026-10-14', f: '2026-10-25' },
    { e: 'Nader', t: 'annual', s: '2026-10-15', f: '2026-10-17' },
    { e: 'Arjun', t: 'annual', s: '2026-10-20', f: '2026-10-21' },
    { e: 'Mia', t: 'sick', s: '2026-10-26', f: '2026-10-27' },
    { e: 'Nader', t: 'annual', s: '2026-10-29', f: '2026-10-31' },
    // pending decisions for the manager
    { e: 'Amanda', t: 'annual', s: '2026-10-12', f: '2026-10-14', status: 'pending', sub: '2026-10-02T10:15:00' },
    { e: 'Kumar', t: 'sick', s: '2026-10-16', f: '2026-10-16', status: 'pending', sub: '2026-10-05T08:42:00' },
    { e: 'Mia', t: 'emergency', s: '2026-10-15', f: '2026-10-16', status: 'pending', sub: '2026-10-05T16:20:00' },
    { e: 'Jason', t: 'unpaid', s: '2026-10-15', f: '2026-10-15', status: 'pending', sub: '2026-10-04T13:05:00' },
  ];
  explicit.forEach((x) => add({ employeeId: E[x.e], typeId: x.t, start: x.s, end: x.f, status: x.status, submittedAt: x.sub }));

  /* ---- generated history for the team (Jan - Sep 2026) so analytics has substance ---- */
  const occupied = {};
  requests.forEach((r) => {
    occupied[r.employeeId] = occupied[r.employeeId] || new Set();
    rangeDates(r.start, r.end).forEach((d) => occupied[r.employeeId].add(d));
  });

  const workdayStarts = rangeDates('2026-01-05', '2026-09-25').filter((d) => !isWeekend(d) && !HOLIDAYS.some((h) => h.date === d));
  const place = (empId, typeId, len, status) => {
    const type = typeById(typeId);
    for (let tries = 0; tries < 80; tries += 1) {
      const start = workdayStarts[pick(workdayStarts.length)];
      let end = start;
      let counted = 1;
      while (counted < len) {
        end = addDays(end, 1);
        if (leaveDates(end, end, type, HOLIDAYS).length) counted += 1;
      }
      const span = rangeDates(start, end);
      if (span.some((d) => occupied[empId].has(d)) || end > '2026-09-30') continue;
      span.forEach((d) => occupied[empId].add(d));
      return add({ employeeId: empId, typeId, start, end, status });
    }
    return null;
  };

  const employees = BASE_EMPLOYEES.map((e) => ({ ...e, base: { annual: 0, sick: 0 } }));
  employees.forEach((emp) => {
    occupied[emp.id] = occupied[emp.id] || new Set();
    const usedTarget = ENTITLEMENT.annual - emp.annualLeft;
    const already = requests.filter((r) => r.employeeId === emp.id && r.status === 'approved' && r.typeId === 'annual').reduce((n, r) => n + r.dates.length, 0);
    let remaining = Math.max(0, usedTarget - already);
    while (remaining > 0) {
      const len = Math.min(remaining, 1 + pick(3));
      const r = place(emp.id, 'annual', len, 'approved');
      if (!r) {
        emp.base.annual += remaining; // couldn't place: keep balance correct anyway
        break;
      }
      remaining -= len;
    }
    const sickEvents = emp.name === 'Jason Lim' ? 5 : 1 + pick(3);
    let sickDays = 0;
    for (let i = 0; i < sickEvents && sickDays < 8; i += 1) {
      const len = 1 + pick(2);
      if (place(emp.id, 'sick', len, 'approved')) sickDays += len;
    }
    const unpaidEvents = emp.name === 'Jason Lim' ? 2 : pick(2);
    for (let i = 0; i < unpaidEvents; i += 1) place(emp.id, 'unpaid', 1 + pick(2), 'approved');
    if (pick(3) === 0) place(emp.id, 'emergency', 1 + pick(2), 'approved');
    for (let i = 0; i < 1 + pick(2); i += 1) place(emp.id, 'annual', 1 + pick(2), 'rejected');
    if (pick(2) === 0) place(emp.id, 'annual', 1 + pick(2), 'cancelled');
  });

  /* ---- the manager's own leave ---- */
  const me = MANAGER.id;
  add({ employeeId: me, typeId: 'annual', start: '2026-02-10', end: '2026-02-12' });
  add({ employeeId: me, typeId: 'annual', start: '2026-06-08', end: '2026-06-10' });
  add({ employeeId: me, typeId: 'sick', start: '2026-03-03', end: '2026-03-03' });
  add({ employeeId: me, typeId: 'sick', start: '2026-09-02', end: '2026-09-02' });
  add({ employeeId: me, typeId: 'annual', start: '2026-08-18', end: '2026-08-19', status: 'rejected', reason: 'Quarter-end release freeze.' });
  const own = add({ employeeId: me, typeId: 'annual', start: '2026-10-12', end: '2026-10-14', status: 'pending', submittedAt: '2026-10-05T09:12:00' });
  if (own) own.id = 'LR-20261005-134';

  // older history so the table has real pagination (113 rows in total, like the wireframe)
  const mgrOcc = new Set();
  requests.filter((r) => r.employeeId === me).forEach((r) => rangeDates(r.start, r.end).forEach((d) => mgrOcc.add(d)));
  const pool = rangeDates('2019-03-04', '2025-12-19').filter((d) => !isWeekend(d));
  let made = requests.filter((r) => r.employeeId === me).length;
  while (made < 113) {
    const start = pool[pick(pool.length)];
    const roll = rand();
    const typeId = roll < 0.55 ? 'annual' : roll < 0.8 ? 'sick' : roll < 0.9 ? 'unpaid' : 'emergency';
    const sRoll = rand();
    const status = sRoll < 0.8 ? 'approved' : sRoll < 0.9 ? 'rejected' : 'cancelled';
    const end = addDays(start, pick(3));
    if (rangeDates(start, end).some((d) => mgrOcc.has(d))) continue;
    if (add({ employeeId: me, typeId, start, end, status })) {
      rangeDates(start, end).forEach((d) => mgrOcc.add(d));
      made += 1;
    }
  }

  return {
    version: 1,
    employees,
    requests,
    holidays: HOLIDAYS,
    leaveTypes: LEAVE_TYPES,
    settings: { maxOff: MAX_OFF, whatsapp: 'linked', emailNotifications: true, showNamesOnHover: true, calendarFavorites: ['e1', 'e2', 'e3'] },
    session: {
      loggedIn: true,
      lastLogin: `${TODAY}T13:32:00`,
      devices: [
        { id: 'd1', name: 'Chrome on Windows', where: 'Kuala Lumpur, MY', at: `${TODAY}T13:32:00`, current: true },
        { id: 'd2', name: 'Safari on iPhone', where: 'Kuala Lumpur, MY', at: '2026-10-03T08:05:00', current: false },
        { id: 'd3', name: 'Edge on Windows', where: 'Petaling Jaya, MY', at: '2026-09-28T17:44:00', current: false },
      ],
    },
  };
}
