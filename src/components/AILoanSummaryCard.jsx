import { useState, useEffect } from 'react'
import { getLoanAdvice } from '../api/agent'

export default function AILoanSummaryCard({ customerId, customerName, onAdviceLoaded }) {
  const [advice, setAdvice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!customerId) return

    // Single API call — the loan advice endpoint already returns
    // risk, confidence, explanation, suggested amount, strengths & weaknesses.
    // No need for a separate business health call (avoids Gemini 429 rate limit).
    const loadData = async () => {
      setLoading(true)
      try {
        const a = await getLoanAdvice(customerId)
        const adv = a.data.advice
        setAdvice(adv)
        if (onAdviceLoaded) onAdviceLoaded(adv)
      } catch (e) {
        console.error('Loan advice failed:', e)
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