import { useState, useEffect } from 'react'
import { getLoanAdvice, getBusinessHealth } from '../api/agent'

export default function AILoanSummaryCard({ customerId, customerName, onAdviceLoaded }) {
  const [advice, setAdvice] = useState(null)
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!customerId) return

    // Call sequentially to avoid hitting the Gemini API rate limit (429).
    // Calling both endpoints in parallel causes the second one to be
    // rate-limited and fail, leaving the UI with health but no advice.
    const loadData = async () => {
      setLoading(true)
      try {
        // 1. Loan advice first (most important — drives the suggested amount)
        try {
          const a = await getLoanAdvice(customerId)
          const adv = a.data.advice
          setAdvice(adv)
          if (onAdviceLoaded) onAdviceLoaded(adv)
        } catch (e) {
          console.error('Loan advice failed:', e)
        }

        // Small delay to let the rate limit reset
        await new Promise(r => setTimeout(r, 500))

        // 2. Business health second
        try {
          const h = await getBusinessHealth(customerId)
          setHealth(h.data.health)
        } catch (e) {
          console.error('Business health failed:', e)
        }
      } catch (e) {
        setError('AI advice unavailable.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
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