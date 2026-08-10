import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'

const icons = { error: AlertCircle, danger: AlertCircle, success: CheckCircle2, info: Info, warning: TriangleAlert }

export default function Alert({ type = 'info', title, message, onClose, className = '' }) {
  const Icon = icons[type] || Info
  return (
    <div className={`lux-alert lux-alert--${type} ${className}`.trim()} role={type === 'error' || type === 'danger' ? 'alert' : 'status'}>
      <Icon size={20} aria-hidden="true" />
      <div className="lux-alert__body">
        {title && <strong>{title}</strong>}
        <p>{message}</p>
      </div>
      {onClose && <button type="button" className="lux-alert__close" onClick={onClose} aria-label="Dismiss"><X size={17} /></button>}
    </div>
  )
}
