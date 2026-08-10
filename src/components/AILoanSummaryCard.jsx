import { useState, useEffect } from 'react'
import { getLoanAdvice, getBusinessHealth } from '../api/agent'

export default function AILoanSummaryCard({ customerId, customerName, onAdviceLoaded }) {
  const [advice, setAdvice] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!customerId) return
    Promise.allSettled([getLoanAdvice(customerId), getBusinessHealth(customerId)])
      .then(([a, h]) => {
        if (a.status === 'fulfilled') {
          const adv = a.value.data.advice
          setAdvice(adv)
          if (onAdviceLoaded) onAdviceLoaded(adv)
        }
        if (h.status === 'fulfilled') setHealth(h.value.data.health)
      })
      .catch(() => setError('AI advice unavailable.'))
      .finally(() => setLoading(false))
  }, [customerId])

  if (loading) return <div className="card shadow-sm mb-3"><div className="card-body text-center text-muted">Loading AI insights…</div></div>
  if (error) return null

  const riskColor = advice?.risk_summary === 'low' ? 'success' : advice?.risk_summary === 'medium' ? 'warning' : 'danger'

  return (
    <div className="card shadow-sm mb-3 border-primary">
      <div className="card-body">
        <h6 className="card-title d-flex align-items-center gap-2">
          <span>🤖</span> AI Credit Summary — {customerName}
        </h6>
        {health && (
          <div className="mb-2">
            <span className="badge bg-info me-2">Health: {health.health_label} ({health.business_health}/100)</span>
            <span className="badge bg-secondary me-2">Risk: {health.risk}</span>
            <span className="badge bg-primary">Confidence: {health.confidence}%</span>
          </div>
        )}
        {advice && (
          <>
            <p className="mb-1"><strong>Suggested Loan:</strong> E{advice.suggested_loan_amount}</p>
            <p className="mb-1"><strong>Risk:</strong> <span className={`text-${riskColor}`}>{advice.risk_summary}</span></p>
            <p className="mb-1"><strong>Confidence:</strong> {advice.confidence}%</p>
            <p className="mb-1"><strong>Why:</strong> {advice.explanation}</p>
            {advice.strengths?.length > 0 && (
              <p className="mb-1"><strong>Strengths:</strong> {advice.strengths.join(', ')}</p>
            )}
            {advice.weaknesses?.length > 0 && (
              <p className="mb-1"><strong>Weaknesses:</strong> {advice.weaknesses.join(', ')}</p>
            )}
            <small className="text-muted">Advisory only — agent makes the final decision.</small>
          </>
        )}
      </div>
    </div>
  )
}