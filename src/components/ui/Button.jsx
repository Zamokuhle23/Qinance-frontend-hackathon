export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button className={`lux-button lux-button--${variant} lux-button--${size} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
