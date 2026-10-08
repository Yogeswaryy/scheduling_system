import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { MANAGER, typeById } from '../lib/constants';
import { displayStatus, STATUS_LABEL } from '../lib/calc';
import { fmtDatesShort, year } from '../lib/dates';
import { Confirm, Empty, Modal, PageTitle, Select, StatusPill } from '../components/ui';

const EMPTY_FILTER = { status: 'all', type: 'all', year: 'all' };


function RowsMenu({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="rows-menu" ref={ref}>
      <button className="btn rows-trigger" type="button" onClick={() => setOpen((v) => !v)} aria-haspopup="listbox" aria-expanded={open}>
        <span>Row</span>
        <strong>{value}</strong>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && (
        <div className="rows-menu-pop glass" role="listbox" aria-label="Rows per page">
          {[10, 20, 30, 50, 100].map((n) => (
            <button
              key={n}
              type="button"
              role="option"
              aria-selected={value === n}
              className={value === n ? 'selected' : ''}
              onClick={() => { onChange(n); setOpen(false); }}
            >
              <span>{n}</span>
              {value === n && <Check size={15} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function History() {
  const { state, actions } = useStore();
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [draft, setDraft] = useState(EMPTY_FILTER);
  const [showFilter, setShowFilter] = useState(false);
  const [rows, setRows] = useState(10);
  const [page, setPage] = useState(0);
  const [cancelId, setCancelId] = useState(null);

  const mine = useMemo(
    () => state.requests.filter((r) => r.employeeId === MANAGER.id).sort((a, b) => b.start.localeCompare(a.start)),
    [state.requests]
  );
  const years = [...new Set(mine.map((r) => year(r.start)))].sort((a, b) => b - a);
  const filtered = mine.filter(
    (r) => (filter.status === 'all' || displayStatus(r) === filter.status) && (filter.type === 'all' || r.typeId === filter.type) && (filter.year === 'all' || year(r.start) === +filter.year)
  );
  const pages = Math.max(1, Math.ceil(filtered.length / rows));
  const cur = Math.min(page, pages - 1);
  const slice = filtered.slice(cur * rows, cur * rows + rows);
  const from = filtered.length ? cur * rows + 1 : 0;
  const to = Math.min(filtered.length, cur * rows + rows);
  const active = Object.values(filter).filter((v) => v !== 'all').length;

  return (
    <div className="page history">
      <PageTitle
        right={
          <div className="table-tools">
            <button className="btn" onClick={() => { setDraft(filter); setShowFilter(true); }}>
              Filter{active ? ` (${active})` : ''}
            </button>
            <RowsMenu value={rows} onChange={(n) => { setRows(n); setPage(0); }} />
            <button className="btn icon" disabled={cur === 0} onClick={() => setPage(cur - 1)} aria-label="Previous page">
              <ChevronLeft size={18} />
            </button>
            <button className="btn icon" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)} aria-label="Next page">
              <ChevronRight size={18} />
            </button>
          </div>
        }
       searchPlaceholder="Ask about past leave, statuses or cancellations…"
      >
        Leave History
      </PageTitle>

      <div className="glass table-card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Date</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((r) => (
                <tr key={r.id}>
                  <td>{typeById(r.typeId).name}</td>
                  <td>{fmtDatesShort(r.dates)}</td>
                  <td>{r.dates.length} {r.dates.length === 1 ? 'day' : 'days'}</td>
                  <td>
                    <StatusPill request={r} />
                  </td>
                  <td>
                    <Link className="link-btn" to={`/request/${r.id}`}>
                      View
                    </Link>
                    {r.status === 'pending' && (
                      <>
                        {' / '}
                        <button className="link-btn" onClick={() => setCancelId(r.id)}>
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <Empty>No leave records match these filters.</Empty>}
      </div>
      <div className="pager-label">
        {from} - {to} of {filtered.length}
      </div>

      {showFilter && (
        <Modal
          title="Filter leave history"
          onClose={() => setShowFilter(false)}
          width={420}
          actions={
            <>
              <button
                className="btn ghost"
                onClick={() => {
                  setFilter(EMPTY_FILTER);
                  setPage(0);
                  setShowFilter(false);
                }}
              >
                Clear
              </button>
              <button
                className="btn"
                onClick={() => {
                  setFilter(draft);
                  setPage(0);
                  setShowFilter(false);
                }}
              >
                Apply
              </button>
            </>
          }
        >
          <div className="form-row">
            <span>Status</span>
            <Select
              value={draft.status}
              onChange={(status) => setDraft({ ...draft, status })}
              ariaLabel="Status"
              className="field-select"
              options={[
                { value: 'all', label: 'All statuses' },
                ...Object.entries(STATUS_LABEL).map(([value, label]) => ({ value, label })),
              ]}
            />
          </div>
          <div className="form-row">
            <span>Leave type</span>
            <Select
              value={draft.type}
              onChange={(type) => setDraft({ ...draft, type })}
              ariaLabel="Leave type"
              className="field-select"
              options={[
                { value: 'all', label: 'All types' },
                ...state.leaveTypes.map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
          </div>
          <div className="form-row">
            <span>Year</span>
            <Select
              value={draft.year}
              onChange={(selectedYear) => setDraft({ ...draft, year: selectedYear })}
              ariaLabel="Year"
              className="field-select"
              options={[
                { value: 'all', label: 'All years' },
                ...years.map((y) => ({ value: String(y), label: String(y) })),
              ]}
            />
          </div>
        </Modal>
      )}

      {cancelId && (
        <Confirm title="Cancel this request?" confirmLabel="Cancel request" cancelLabel="Keep it" danger onClose={() => setCancelId(null)} onConfirm={() => actions.cancel(cancelId)}>
          The request will be withdrawn and no balance will be deducted.
        </Confirm>
      )}
    </div>
  );
}
