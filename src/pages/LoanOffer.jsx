import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getLoanOffers, createLoanFromOffer } from '../api/agent'
import AILoanSummaryCard from '../components/AILoanSummaryCard'
import AIChat from '../components/AIChat'

export default function LoanOffer() {
  const { customerId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const [maxAllowedAmount, setMaxAllowedAmount] = useState(99999)
  const [currentAmount, setCurrentAmount] = useState(searchParams.get('amount') || 250)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getLoanOffers(customerId, currentAmount)
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load offers.'))
      .finally(() => setLoading(false))
  }, [customerId, currentAmount])

  const handleAdviceLoaded = (advice) => {
    if (advice && advice.suggested_loan_amount) {
      setMaxAllowedAmount(advice.suggested_loan_amount)
      setCurrentAmount(advice.suggested_loan_amount)
    }
  }

  const handleAccept = async (offer) => {
    setSubmitting(true)
    try {
      await createLoanFromOffer(customerId, {
        amount: currentAmount,
        interest: offer.interest,
        days: offer.days,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create loan.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !data) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>
  if (error && !data) return <div className="container py-3"><div className="alert alert-danger">{error}</div></div>

  return (
    <div className="container py-3" style={{ maxWidth: 600 }}>
      <h4 className="mb-1">Loan Offers</h4>
      <p className="text-muted mb-3">Customer: <strong>{data?.customer?.name}</strong> — Approved Amount: <strong>E{parseFloat(currentAmount).toFixed(2)}</strong></p>
      <AILoanSummaryCard 
        customerId={customerId} 
        customerName={data?.customer?.name} 
        onAdviceLoaded={handleAdviceLoaded}
      />
      
      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <label className="form-label fw-bold text-dark">Approved Loan Amount (SZL)</label>
          <div className="input-group">
            <span className="input-group-text">E</span>
            <input
              type="number"
              className="form-control fw-bold text-primary"
              value={currentAmount}
              max={maxAllowedAmount}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0
                if (val > maxAllowedAmount) {
                  setError(`Approved amount cannot exceed the AI suggested limit of E${maxAllowedAmount}`)
                } else {
                  setError('')
                  setCurrentAmount(val)
                }
              }}
            />
          </div>
          <div className="d-flex justify-content-between mt-1">
            <small className="text-muted">Max AI Suggested Limit: E{maxAllowedAmount}</small>
            {error && <span className="text-danger small">{error}</span>}
          </div>
        </div>
      </div>

      <AIChat customerId={customerId} customerName={data?.customer?.name} />
      <div className="row g-3">
        {data.offers.map(offer => (
          <div className="col-md-6" key={offer.interest}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">{offer.interest}% Interest</h5>
                <table className="table table-sm mb-3">
                  <tbody>
                    <tr><td>Duration</td><td className="fw-bold">{offer.days} days</td></tr>
                    <tr><td>Total Due</td><td className="fw-bold">E{offer.total_due}</td></tr>
                    <tr><td>Daily Payment</td><td className="fw-bold text-primary">E{offer.daily_payment}</td></tr>
                  </tbody>
                </table>
                <button
                  className="btn btn-success w-100"
                  onClick={() => handleAccept(offer)}
                  disabled={submitting}
                >
                  {submitting ? 'Processing…' : 'Accept This Offer'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-outline-secondary mt-3" onClick={() => navigate(-1)}>Back</button>
    </div>
  )
}
