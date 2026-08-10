import { forwardRef, useId } from 'react'

const Checkbox = forwardRef(function Checkbox({ label, className = '', id, ...props }, ref) {
  const generatedId = useId()
  const inputId = id || generatedId
  return (
    <label className={`lux-checkbox ${className}`.trim()} htmlFor={inputId}>
      <input ref={ref} id={inputId} type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  )
})

export default Checkbox
