import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { STATUS_LABEL, displayStatus } from '../lib/calc';
import { Check, ChevronDown, Send, X } from 'lucide-react';

export function Select({ value, onChange, options, ariaLabel, className = '' }) {
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => String(option.value) === String(value)));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const ref = useRef(null);
  const listId = useId();
  const selected = options[selectedIndex];

  useEffect(() => {
    const close = (event) => ref.current && !ref.current.contains(event.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (open) setActiveIndex(selectedIndex);
  }, [open, selectedIndex]);

  const choose = (option) => {
    onChange(option.value);
    setOpen(false);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) => (index + step + options.length) % options.length);
      return;
    }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(options[activeIndex]);
      else setOpen(true);
    }
  };

  return (
    <div className={`custom-select ${open ? 'open' : ''} ${className}`.trim()} ref={ref}>
      <button
        type="button"
        className="custom-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onKeyDown}
      >
        <span>{selected?.label}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <ul className="custom-select-menu" id={listId} role="listbox" aria-label={ariaLabel}>
          {options.map((option, index) => {
            const isSelected = String(option.value) === String(value);
            return (
              <li key={String(option.value)}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`${isSelected ? 'selected' : ''} ${index === activeIndex ? 'active' : ''}`.trim()}
                  tabIndex={-1}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check size={15} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function PageTitle({ children, right, searchPlaceholder }) {
  return (
    <div className="page-title-block">
      <div className="page-head">
        <h1 className="page-title">{children}</h1>
        {right ? <div className="page-head-right">{right}</div> : null}
      </div>
      {searchPlaceholder ? (
        <form
          className="ai-page-search"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <input type="search" placeholder={searchPlaceholder} aria-label={`AI search for ${children}`} />
          <button className="ask-go ai-page-send" type="submit" aria-label={`Send AI prompt for ${children}`}>
            <Send size={18} />
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function StatCard({ label, children, onClick, tone }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={`glass stat ${onClick ? 'clickable' : ''} ${tone || ''}`} onClick={onClick} type={onClick ? 'button' : undefined}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{children}</span>
    </Tag>
  );
}

export function Of({ left, total, unit = 'Days' }) {
  return (
    <>
      {left} {unit} <span className="muted-val">/ {total} {unit}</span>
    </>
  );
}

export function StatusPill({ request, status, long }) {
  const s = status || displayStatus(request);
  return <span className={`pill pill-${s}`}>{long && s === 'pending' ? 'Pending Approval' : STATUS_LABEL[s]}</span>;
}

export function Modal({ title, onClose, children, actions, width = 520 }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {actions ? <div className="modal-actions">{actions}</div> : null}
      </div>
    </div>,
    document.body
  );
}

export function Confirm({ title, children, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger, onConfirm, onClose }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      width={460}
      actions={
        <>
          <button className="btn ghost" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            className={`btn ${danger ? 'danger' : ''}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

export function Toasts({ toasts }) {
  return createPortal(
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone}`}>
          {t.msg}
        </div>
      ))}
    </div>,
    document.body
  );
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}
