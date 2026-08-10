import GlassCard from './GlassCard'

export default function MetricCard({ icon: Icon, label, value, change, changeType = 'positive', trend, className = '' }) {
  return (
    <GlassCard className={`metric-card ${className}`.trim()}>
      <div className="metric-card__top">
        <div><p>{label}</p><strong>{value}</strong></div>
        {Icon && <span className="metric-card__icon"><Icon size={22} /></span>}
      </div>
      {change !== undefined && change !== null && (
        <div className="metric-card__trend">
          <span className={`metric-card__change metric-card__change--${changeType}`}>{changeType === 'positive' ? '+' : ''}{change}%</span>
          <span>{trend || 'from last month'}</span>
        </div>
      )}
    </GlassCard>
  )
}
