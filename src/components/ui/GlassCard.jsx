export default function GlassCard({ children, className = '', interactive = false, ...props }) {
  return (
    <div className={`glass-card${interactive ? ' glass-card--interactive' : ''} ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}
