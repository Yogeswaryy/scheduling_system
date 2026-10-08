import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DAYS_SHORT, MONTHS, TODAY, dayNum, monthIdx, monthMatrix, year } from '../lib/dates';

/** Generic Mon-Sun month grid. `renderCell(date, inMonth)` supplies the cell body. */
export function MonthGrid({ y, m, renderCell, cellProps, className = '' }) {
  const weeks = monthMatrix(y, m);
  return (
    <div className={`month-grid ${className}`}>
      {DAYS_SHORT.map((d) => (
        <div key={d} className="mg-head">
          {d}
        </div>
      ))}
      {weeks.flat().map((d) => {
        const inMonth = year(d) === y && monthIdx(d) === m;
        return (
          <div key={d} className={`mg-cell ${inMonth ? '' : 'out'} ${d === TODAY ? 'today' : ''}`} {...(cellProps ? cellProps(d, inMonth) : {})}>
            {renderCell(d, inMonth)}
          </div>
        );
      })}
    </div>
  );
}

export function MonthNav({ label, onPrev, onNext, onToday }) {
  return (
    <div className="month-nav">
      <button className="btn icon" onClick={onPrev} aria-label="Previous">
        <ChevronLeft size={18} />
      </button>
      <button className="btn icon" onClick={onNext} aria-label="Next">
        <ChevronRight size={18} />
      </button>
      <span className="month-label">{label}</span>
      {onToday ? (
        <button className="btn light" onClick={onToday}>
          Today
        </button>
      ) : null}
    </div>
  );
}

/** Compact two-month range picker popup (the "calendar drop down" wireframe). */
export function RangePicker({ y, m, start, end, onPick, onNav, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && !e.target.closest('[data-picker-trigger]') && onClose();
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  const second = m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 };
  const inRange = (d) => start && end && d > start && d < end;

  const Month = ({ yy, mm, showPrev, showNext }) => (
    <div className="rp-month">
      <div className="rp-title">
        {showPrev ? (
          <button type="button" className="rp-nav" onClick={() => onNav(-1)} aria-label="Previous month">
            <ChevronLeft size={14} />
          </button>
        ) : (
          <span />
        )}
        <span>
          {MONTHS[mm]} {yy}
        </span>
        {showNext ? (
          <button type="button" className="rp-nav" onClick={() => onNav(1)} aria-label="Next month">
            <ChevronRight size={14} />
          </button>
        ) : (
          <span />
        )}
      </div>
      <div className="rp-grid">
        {DAYS_SHORT.map((d) => (
          <span key={d} className="rp-dow">
            {d[0]}
          </span>
        ))}
        {monthMatrix(yy, mm)
          .flat()
          .map((d) => {
            const inM = year(d) === yy && monthIdx(d) === mm;
            if (!inM) return <span key={d} />;
            const sel = d === start || d === end;
            return (
              <button type="button" key={d} className={`rp-day ${sel ? 'sel' : ''} ${inRange(d) ? 'mid' : ''} ${d === TODAY ? 'tod' : ''}`} onClick={() => onPick(d)}>
                {dayNum(d)}
              </button>
            );
          })}
      </div>
    </div>
  );

  return (
    <div className="range-picker" ref={ref}>
      <Month yy={y} mm={m} showPrev />
      <Month yy={second.y} mm={second.m} showNext />
    </div>
  );
}
