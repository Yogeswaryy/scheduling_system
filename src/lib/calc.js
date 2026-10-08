// All business logic lives here (pure functions) so pages stay thin and the same rules
// can later be moved to / validated by the backend.
import { ENTITLEMENT, MANAGER, typeById } from './constants';
import { TODAY, addDays, dayNum, fmtDM, fmtDMY, isWeekend, monthIdx, rangeDates, startOfWeek, year } from './dates';

/* ---------- leave days ---------- */

/** Dates that actually count as leave. Maternity counts calendar days; others skip weekends + holidays. */
export function leaveDates(start, end, type, holidays) {
  if (!start || !end || end < start) return [];
  const hs = new Set(holidays.map((h) => h.date));
  return rangeDates(start, end).filter((d) => (type.calendarDays ? true : !isWeekend(d) && !hs.has(d)));
}

export const displayStatus = (r) => (r.status === 'approved' && r.end < TODAY ? 'completed' : r.status);

export const STATUS_LABEL = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Declined',
  cancelled: 'Cancelled',
  completed: 'Completed',
};

export const isLive = (r) => r.status === 'pending' || r.status === 'approved';

/* ---------- balances ---------- */

export function balanceOf(state, empId, key, yr = year(TODAY)) {
  const emp = empId === MANAGER.id ? { base: { annual: 0, sick: 0 } } : state.employees.find((e) => e.id === empId);
  const entitlement = ENTITLEMENT[key];
  const base = (emp && emp.base && emp.base[key]) || 0;
  const used = state.requests
    .filter((r) => r.employeeId === empId && r.status === 'approved' && typeById(r.typeId).balanceKey === key && year(r.start) === yr)
    .reduce((n, r) => n + r.dates.length, 0);
  return { entitlement, used: used + base, left: Math.max(0, entitlement - used - base) };
}

/* ---------- people ---------- */

export const personName = (state, id) => (id === MANAGER.id ? `${MANAGER.name} (You)` : state.employees.find((e) => e.id === id)?.name || 'Unknown');
export const firstName = (state, id) => (id === MANAGER.id ? MANAGER.first : (state.employees.find((e) => e.id === id)?.name || '').split(' ')[0]);
export const personOf = (state, id) => (id === MANAGER.id ? MANAGER : state.employees.find((e) => e.id === id));

/* ---------- staffing ---------- */

export const teamSize = (state) => state.employees.length;
export const minOnDuty = (state) => teamSize(state) - state.settings.maxOff;

/** Team members (not the manager) with APPROVED leave on `date`. */
export function offIds(state, date) {
  const ids = new Set();
  state.requests.forEach((r) => {
    if (r.status === 'approved' && r.employeeId !== MANAGER.id && r.dates.includes(date)) ids.add(r.employeeId);
  });
  return ids;
}

/** Day status for the "This week at a glance" widget. */
export function dayStatus(state, date) {
  const off = offIds(state, date);
  const n = off.size;
  const allEmps = state.employees;
  let status;
  let conflicts = 0;
  if (n > state.settings.maxOff) {
    status = { label: 'Alert', tone: 'red' };
  } else {
    off.forEach((id) => {
      const e = allEmps.find((x) => x.id === id);
      const hasCover = allEmps.some((c) => c.id !== id && !off.has(c.id) && (c.dept === e.dept || c.covers.includes(e.dept)));
      if (!hasCover) conflicts += 1;
    });
    status = conflicts ? { label: `${conflicts} conflict${conflicts > 1 ? 's' : ''}`, tone: 'amber' } : { label: 'Backup OK', tone: 'green' };
  }
  return { date, count: n, ...status };
}

export const coverageAlerts = (state, from = TODAY, days = 14) =>
  rangeDates(from, addDays(from, days - 1)).filter((d) => !isWeekend(d)).map((d) => dayStatus(state, d)).filter((s) => s.tone !== 'green');

export const onLeaveToday = (state) => [...offIds(state, TODAY)].map((id) => state.employees.find((e) => e.id === id));

/* ---------- approval analysis ---------- */

export function analyseRequest(state, r) {
  const emp = personOf(state, r.employeeId);
  const req = minOnDuty(state);
  const total = teamSize(state);
  const workDays = r.dates.filter((d) => !isWeekend(d));

  const days = workDays.map((d) => {
    const availableNow = total - offIds(state, d).size;
    return { date: d, required: req, availableNow, ifApproved: availableNow - 1 };
  });

  const cover = state.employees
    .filter((e) => e.id !== r.employeeId && (e.dept === emp.dept || e.covers.includes(emp.dept)))
    .map((e) => {
      const free = workDays.filter((d) => !offIds(state, d).has(e.id));
      let can;
      let type;
      if (free.length === 0) {
        can = 'No';
        type = 'Not Available';
      } else if (free.length === workDays.length && e.dept === emp.dept) {
        can = 'Yes';
        type = 'Full Replacement';
      } else {
        can = 'Partial';
        type = 'Shared Coverage';
      }
      return { emp: e, can, type, free: free.length };
    })
    .sort((a, b) => ({ Yes: 0, Partial: 1, No: 2 }[a.can] - { Yes: 0, Partial: 1, No: 2 }[b.can]) || b.free - a.free);

  const suggested = cover.find((c) => c.can !== 'No')?.emp || null;
  const below = days.filter((d) => d.ifApproved < d.required);
  const atLimit = days.filter((d) => d.ifApproved === d.required);
  const impact = below.length ? 'High' : atLimit.length ? 'Medium' : 'Low';

  const type = typeById(r.typeId);
  let balance = null;
  if (type.balanceKey) {
    const b = balanceOf(state, r.employeeId, type.balanceKey, year(r.start));
    balance = { key: type.balanceKey, left: b.left, after: b.left - r.dates.length, short: b.left - r.dates.length < 0 };
  }
  return { emp, days, cover, suggested, below, impact, balance };
}

/* ---------- team helpers ---------- */

export const nextLeaveOf = (state, empId) =>
  state.requests
    .filter((r) => r.employeeId === empId && isLive(r) && r.dates.length && r.dates[r.dates.length - 1] >= TODAY)
    .sort((a, b) => a.start.localeCompare(b.start))[0] || null;

/* ---------- analytics ---------- */

export function analytics(state, yr, month /* 0-11 or 'all' */) {
  const team = state.requests.filter((r) => r.employeeId !== MANAGER.id);
  const inPeriod = (d) => year(d) === yr && (month === 'all' || monthIdx(d) === month);
  const reqs = team.filter((r) => inPeriod(r.start));
  const daysIn = (r) => r.dates.filter(inPeriod).length;

  const approved = reqs.filter((r) => r.status === 'approved');
  const onLeave = new Set(approved.map((r) => r.employeeId));

  const perEmp = (typeId) => {
    const m = {};
    approved.filter((r) => !typeId || r.typeId === typeId).forEach((r) => {
      m[r.employeeId] = (m[r.employeeId] || 0) + daysIn(r);
    });
    return Object.entries(m).map(([id, days]) => ({ emp: state.employees.find((e) => e.id === id), days })).sort((a, b) => b.days - a.days);
  };

  const mc = perEmp('sick')[0];
  const unpaid = approved.filter((r) => r.typeId === 'unpaid').reduce((n, r) => n + daysIn(r), 0);

  const dist = state.leaveTypes.map((t) => ({ type: t, count: reqs.filter((r) => r.typeId === t.id).length }));

  const lastMonth = month === 'all' ? (yr === year(TODAY) ? monthIdx(TODAY) : 11) : month;
  const months = Array.from({ length: lastMonth + 1 }, (_, i) => i);
  const monthly = months.map((m) => {
    const mr = team.filter((r) => year(r.start) === yr && monthIdx(r.start) === m);
    return {
      m,
      submitted: mr.length,
      approved: mr.filter((r) => r.status === 'approved').length,
      rejected: mr.filter((r) => r.status === 'rejected').length,
      cancelled: mr.filter((r) => r.status === 'cancelled').length,
    };
  });

  return {
    total: reqs.length,
    onLeave: onLeave.size,
    pending: reqs.filter((r) => r.status === 'pending').length,
    highestMc: mc ? mc.emp.name : '—',
    unpaid,
    perEmp,
    dist,
    monthly,
  };
}

/* ---------- assistant ("How can I help you today?") ---------- */

export function askAssistant(state, qRaw) {
  const q = qRaw.toLowerCase();
  const nextMon = addDays(startOfWeek(TODAY), 7);
  const nextWeek = rangeDates(nextMon, addDays(nextMon, 6));
  const pending = state.requests.filter((r) => r.status === 'pending' && r.employeeId !== MANAGER.id);

  if (/(who).*(off|leave|away|out)/.test(q) && /next week/.test(q)) {
    const rows = state.requests
      .filter((r) => r.employeeId !== MANAGER.id && isLive(r) && r.dates.some((d) => nextWeek.includes(d)))
      .map((r) => ({ text: `${personName(state, r.employeeId)} — ${typeById(r.typeId).short}, ${r.dates.filter((d) => nextWeek.includes(d)).map((d) => `${dayNum(d)}`).join(', ')} ${fmtDM(nextMon).split(' ')[1]}${r.status === 'pending' ? ' (pending)' : ''}`, to: `/request/${r.id}` }));
    return { title: `Off next week (${fmtDM(nextMon)} – ${fmtDM(addDays(nextMon, 6))})`, items: rows.length ? rows : [{ text: 'Nobody is booked off next week.' }] };
  }
  if (/(below|under|minimum|staff|coverage)/.test(q)) {
    const low = rangeDates(TODAY, addDays(TODAY, 30)).filter((d) => !isWeekend(d)).map((d) => ({ d, avail: teamSize(state) - offIds(state, d).size })).filter((x) => x.avail < minOnDuty(state));
    return {
      title: `Days below minimum staffing (${minOnDuty(state)} of ${teamSize(state)} on duty), next 30 days`,
      items: low.length ? low.map((x) => ({ text: `${fmtDMY(x.d)} — only ${x.avail} on duty`, to: '/calendar' })) : [{ text: 'No approved leave takes the team below the minimum.' }],
    };
  }
  if (/(high|impact|risk)/.test(q)) {
    const hi = pending.map((r) => ({ r, a: analyseRequest(state, r) })).filter((x) => x.a.impact === 'High');
    return {
      title: 'High-impact pending requests',
      items: hi.length ? hi.map((x) => ({ text: `${x.a.emp.name} — ${typeById(x.r.typeId).short}, ${fmtDM(x.r.start)}${x.r.start !== x.r.end ? ' – ' + fmtDM(x.r.end) : ''}`, to: `/approvals?id=${x.r.id}` })) : [{ text: 'No pending request would breach the minimum staffing.' }],
    };
  }
  if (/(pending|approval|waiting)/.test(q)) {
    return { title: `${pending.length} request${pending.length === 1 ? '' : 's'} awaiting approval`, items: pending.map((r) => ({ text: `${personName(state, r.employeeId)} — ${typeById(r.typeId).short}`, to: `/approvals?id=${r.id}` })) };
  }
  if (/(today|right now)/.test(q)) {
    const t = onLeaveToday(state);
    return { title: 'On leave today', items: t.length ? t.map((e) => ({ text: `${e.name} (${e.dept})` })) : [{ text: 'Everyone is in today.' }] };
  }
  if (/(balance|my leave|remaining|left)/.test(q)) {
    const a = balanceOf(state, MANAGER.id, 'annual');
    const s = balanceOf(state, MANAGER.id, 'sick');
    return { title: 'Your leave balance', items: [{ text: `Annual: ${a.left} of ${a.entitlement} days left` }, { text: `Sick: ${s.left} of ${s.entitlement} days left` }, { text: 'Apply for leave', to: '/apply' }] };
  }
  return {
    title: "I can help with these",
    items: [{ text: 'Who is off next week?' }, { text: 'Which days are below minimum staffing?' }, { text: 'Show high-impact requests' }, { text: 'Pending approvals / who is on leave today / my leave balance' }],
  };
}

export const requestLabel = (r) => `${typeById(r.typeId).name} · ${r.start === r.end ? fmtDMY(r.start) : `${fmtDM(r.start)} – ${fmtDMY(r.end)}`}`;
