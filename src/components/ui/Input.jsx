import { forwardRef, useId } from 'react'

const Input = forwardRef(function Input({ className = '', error, label, icon, id, ...props }, ref) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className="lux-field">
      {label && <label className="lux-field__label" htmlFor={inputId}>{label}</label>}
      <div className={`lux-field__control${error ? ' lux-field__control--error' : ''}`}>
        {icon && <span className="lux-field__icon" aria-hidden="true">{icon}</span>}
        <input ref={ref} id={inputId} className={`lux-input ${className}`.trim()} aria-invalid={Boolean(error)} {...props} />
      </div>
      {typeof error === 'string' && <p className="lux-field__error">{error}</p>}
    </div>
  )
})

export default Input
