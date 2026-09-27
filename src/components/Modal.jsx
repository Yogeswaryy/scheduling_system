import Icon from './Icon'

export default function Modal({ open, title, children, onClose, actions, size = 'md' }) {
  if (!open) return null
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal modal-${size}`} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-head"><h2>{title}</h2><button className="icon-btn" onClick={onClose}><Icon name="close" /></button></div>
        <div className="modal-body">{children}</div>
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  )
}
