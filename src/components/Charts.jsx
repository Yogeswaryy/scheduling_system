import { useState } from 'react';
import { MONTHS_SHORT } from '../lib/dates';

const niceMax = (v) => {
  if (v <= 5) return 5;
  const p = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / p) * p;
};

export function Donut({ slices, centerTop, centerBottom }) {
  const total = slices.reduce((n, s) => n + s.value, 0);
  const R = 78;
  const r = 52;
  let acc = 0;
  const arcs = slices.filter((s) => s.value > 0).map((s) => {
    const a0 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += s.value;
    const a1 = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const p = (rad, a) => [100 + rad * Math.cos(a), 100 + rad * Math.sin(a)];
    const [x0, y0] = p(R, a0);
    const [x1, y1] = p(R, a1);
    const [x2, y2] = p(r, a1);
    const [x3, y3] = p(r, a0);
    const full = s.value === total;
    const d = full
      ? `M100 ${100 - R} A${R} ${R} 0 1 1 99.99 ${100 - R} L99.99 ${100 - r} A${r} ${r} 0 1 0 100 ${100 - r} Z`
      : `M${x0} ${y0} A${R} ${R} 0 ${large} 1 ${x1} ${y1} L${x2} ${y2} A${r} ${r} 0 ${large} 0 ${x3} ${y3} Z`;
    return { ...s, d };
  });
  return (
    <svg viewBox="0 0 200 200" className="donut" role="img" aria-label="Leave type distribution">
      {total === 0 ? <circle cx="100" cy="100" r={(R + r) / 2} fill="none" stroke="#d8dbe8" strokeWidth={R - r} /> : null}
      {arcs.map((a) => (
        <path key={a.label} d={a.d} fill={a.color} stroke="rgba(255,255,255,.8)" strokeWidth="1.5">
          <title>{`${a.label}: ${a.value}`}</title>
        </path>
      ))}
      <text x="100" y="98" textAnchor="middle" className="donut-n">
        {centerTop}
      </text>
      <text x="100" y="116" textAnchor="middle" className="donut-s">
        {centerBottom}
      </text>
    </svg>
  );
}

const W = 520;
const H = 230;
const PAD = { l: 34, r: 14, t: 14, b: 26 };

function Axes({ labels, max, step }) {
  const ticks = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  return (
    <g>
      {ticks.map((v) => {
        const y = PAD.t + ih - (v / max) * ih;
        return (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y} y2={y} className="gridline" />
            <text x={PAD.l - 8} y={y + 4} textAnchor="end" className="axis">
              {v}
            </text>
          </g>
        );
      })}
      {labels.map((l, i) => (
        <text key={l} x={PAD.l + (iw / labels.length) * (i + 0.5)} y={H - 6} textAnchor="middle" className="axis">
          {l}
        </text>
      ))}
    </g>
  );
}

export function LineChart({ months, series }) {
  const labels = months.map((m) => MONTHS_SHORT[m]);
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const step = max / 4;
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const x = (i) => PAD.l + (iw / labels.length) * (i + 0.5);
  const y = (v) => PAD.t + ih - (v / max) * ih;
  const [hover, setHover] = useState(null);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Monthly leave trend">
      <Axes labels={labels} max={max} step={step} />
      {series.map((s) => {
        const pts = s.values.map((v, i) => [x(i), y(v)]);
        const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
        const area = `${line} L${pts[pts.length - 1][0]} ${PAD.t + ih} L${pts[0][0]} ${PAD.t + ih} Z`;
        return (
          <g key={s.label}>
            <path d={area} fill={s.color} opacity=".12" />
            <path d={line} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p[0]} cy={p[1]} r={hover === `${s.label}${i}` ? 6 : 4} fill={s.color} stroke="#fff" strokeWidth="1.5" onMouseEnter={() => setHover(`${s.label}${i}`)} onMouseLeave={() => setHover(null)}>
                <title>{`${s.label} · ${labels[i]}: ${s.values[i]}`}</title>
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function GroupedBars({ months, series, percent }) {
  const labels = months.map((m) => MONTHS_SHORT[m]);
  const max = percent ? 100 : niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const step = max / 4;
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const group = iw / labels.length;
  const bw = Math.min(14, (group * 0.8) / series.length);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Approval and cancellation activity">
      <Axes labels={labels} max={max} step={step} />
      {labels.map((l, i) =>
        series.map((s, j) => {
          const v = s.values[i];
          const h = (v / max) * ih;
          const bx = PAD.l + group * i + group / 2 - (bw * series.length) / 2 + bw * j;
          return (
            <rect key={`${l}${s.label}`} x={bx} y={PAD.t + ih - h} width={bw - 2} height={Math.max(h, 0)} rx="2.5" fill={s.color}>
              <title>{`${s.label} · ${l}: ${percent ? v + '%' : v}`}</title>
            </rect>
          );
        })
      )}
    </svg>
  );
}
