// Date helpers. All dates are ISO strings "YYYY-MM-DD" (local, no timezone maths).

// The demo data is anchored around October 2026. Flip USE_REAL_DATE to true once
// the portal is connected to a real backend so "today" follows the system clock.
export const USE_REAL_DATE = false;
export const DEMO_DATE = '2026-10-06';

const pad = (n) => String(n).padStart(2, '0');

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parse = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};

export const TODAY = USE_REAL_DATE ? toISO(new Date()) : DEMO_DATE;

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const addDays = (s, n) => {
  const d = parse(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
export const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
export const dow = (s) => (parse(s).getDay() + 6) % 7; // Monday = 0
export const isWeekend = (s) => dow(s) >= 5;
export const startOfWeek = (s) => addDays(s, -dow(s));
export const year = (s) => +s.slice(0, 4);
export const monthIdx = (s) => +s.slice(5, 7) - 1;
export const dayNum = (s) => +s.slice(8, 10);

export const rangeDates = (a, b) => {
  const out = [];
  if (!a || !b || b < a) return out;
  let c = a;
  while (c <= b) {
    out.push(c);
    c = addDays(c, 1);
  }
  return out;
};

export const firstOfMonth = (y, m) => `${y}-${pad(m + 1)}-01`;
export const addMonths = (s, n) => {
  const d = parse(s);
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  return toISO(d);
};
export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
export const lastOfMonth = (y, m) => `${y}-${pad(m + 1)}-${pad(daysInMonth(y, m))}`;

/** Weeks (arrays of 7 ISO dates, Mon-Sun) covering the month. */
export const monthMatrix = (y, m) => {
  const first = firstOfMonth(y, m);
  const last = lastOfMonth(y, m);
  let cur = startOfWeek(first);
  const weeks = [];
  while (cur <= last) {
    weeks.push(rangeDates(cur, addDays(cur, 6)));
    cur = addDays(cur, 7);
  }
  return weeks;
};

export const fmtDM = (s) => `${dayNum(s)} ${MONTHS_SHORT[monthIdx(s)]}`;
export const fmtDMY = (s) => `${dayNum(s)} ${MONTHS_SHORT[monthIdx(s)]} ${year(s)}`;
export const fmtLong = (s) => `${DAYS_LONG[dow(s)]} ${fmtDMY(s)}`;
export const fmtMonthYear = (s) => `${MONTHS[monthIdx(s)]} ${year(s)}`;

/** dd/mm/yyyy <-> ISO for the text inputs. */
export const toInput = (s) => (s ? `${pad(dayNum(s))}/${pad(monthIdx(s) + 1)}/${year(s)}` : '');
export const fromInput = (txt) => {
  const m = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})\s*$/.exec(txt || '');
  if (!m) return null;
  const [, d, mo, y] = m.map(Number);
  const dt = new Date(y, mo - 1, d, 12);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return toISO(dt);
};

/** "12, 13, 14 Oct 2026" or "14 – 25 Oct 2026" (used on Team page). */
export const fmtDatesLong = (dates) => {
  if (!dates.length) return '';
  const first = dates[0];
  const last = dates[dates.length - 1];
  const sameMonth = dates.every((d) => d.slice(0, 7) === first.slice(0, 7));
  if (dates.length <= 6 && sameMonth) {
    return `${dates.map(dayNum).join(', ')} ${MONTHS_SHORT[monthIdx(first)]} ${year(first)}`;
  }
  if (first === last) return fmtDMY(first);
  return sameMonth
    ? `${dayNum(first)} – ${dayNum(last)} ${MONTHS_SHORT[monthIdx(first)]} ${year(first)}`
    : `${fmtDM(first)} – ${fmtDMY(last)}`;
};

/** "12 Oct, 13 Oct, 14 Oct" or "14 Oct – 25 Oct" (used on History table). */
export const fmtDatesShort = (dates) => {
  if (!dates.length) return '—';
  if (dates.length <= 3) return dates.map(fmtDM).join(', ');
  return `${fmtDM(dates[0])} – ${fmtDM(dates[dates.length - 1])}`;
};

export const fmtRange = (a, b) => (a === b ? fmtDMY(a) : `${fmtDMY(a)} - ${fmtDMY(b)}`);

/** Local timestamp without timezone, e.g. 2026-10-06T09:30:00. */
export const nowISO = () => {
  const n = new Date();
  return `${TODAY}T${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
};

export const fmtDateTime = (ts) => {
  if (!ts) return '';
  const [d, t] = ts.split('T');
  const [hh, mm] = (t || '00:00').split(':').map(Number);
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${fmtDMY(d)}, ${h12}:${pad(mm)} ${hh >= 12 ? 'PM' : 'AM'}`;
};
