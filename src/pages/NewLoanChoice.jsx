import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLoanQualification, createPendingApplication } from '../api/agent'

export default function NewLoanChoice() {
  const { customerId } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [hasActiveLoan, setHasActiveLoan] = useState(false)
  const [hasPendingApplication, setHasPendingApplication] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    getLoanQualification(customerId)
      .then(res => {
        setCustomer(res.data.customer)
        setHasActiveLoan(res.data.has_active_loan || false)
        setHasPendingApplication(res.data.has_pending_application || false)
      })
      .catch(err => setError(err.response?.data?.error || 'Failed to load customer.'))
      .finally(() => setLoading(false))
  }, [customerId])

  const handleImmediate = () => {
    navigate(`/customers/${customerId}/offer?amount=200`)
  }

  const handleBackground = async () => {
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await createPendingApplication(customerId, { requested_amount: 200 })
      setSuccess('Application submitted! Gemini is analyzing history in the background. You can review and approve it from the Pending Applications hub.')
      setTimeout(() => navigate('/customers'), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit background application.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container py-4" style={{ maxWidth: 550 }}>
      <h4 className="mb-3">New Credit Application</h4>
      {error && <div className="alert alert-danger mb-3">{error}</div>}
      {success && <div className="alert alert-success mb-3">{success}</div>}

      {hasActiveLoan && (
        <div className="alert alert-warning mb-3">
          <strong>⚠️ Active Loan Detected</strong>
          <p className="mb-0 small">
            This customer currently has an active loan. They can still apply for a new loan, but the new loan can only be
            <strong> approved after the active loan is fully paid</strong>.
          </p>
        </div>
      )}

      {hasPendingApplication && (
        <div className="alert alert-info mb-3">
          <strong>⏳ Pending Application Exists</strong>
          <p className="mb-0 small">
            This customer already has a pending application being processed. You can review it from the Pending Applications hub.
          </p>
        </div>
      )}

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <p className="mb-1 text-muted small">APPLICANT MERCHANT</p>
          <h5 className="fw-bold mb-1 text-dark">{customer?.name}</h5>
          <p className="mb-0 text-secondary">{customer?.phone} · Credit Limit: E{customer?.credit_score}</p>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12">
          <div className="card shadow-sm border-primary h-100 card-choice" style={{ cursor: 'pointer' }} onClick={handleImmediate}>
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ fontSize: 24 }}>⚡</span>
                  <h5 className="card-title fw-bold mb-0">See Offer (Immediate Loan)</h5>
                </div>
                <p className="card-text text-muted small">
                  Disburse the loan instantly. View pre-calculated repayment offers and dynamic suggested limit advice on-screen.
                </p>
              </div>
              <button className="btn btn-primary w-100 mt-3" onClick={handleImmediate}>See Offer & Disburse Now</button>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm border-success h-100 card-choice" style={{ cursor: 'pointer' }} onClick={!submitting ? handleBackground : undefined}>
            <div className="card-body d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span style={{ fontSize: 24 }}>⏳</span>
                  <h5 className="card-title fw-bold mb-0 text-success">Apply Loan (Async Background)</h5>
                </div>
                <p className="card-text text-muted small">
                  File the credit application to be processed by Gemini in the background. The result is saved, and you can review and disburse it later from the Pending Applications hub.
                </p>
              </div>
              <button className="btn btn-success w-100 mt-3" disabled={submitting} onClick={handleBackground}>
                {submitting ? 'Submitting...' : 'Apply Loan Asynchronously'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn-outline-secondary w-100 mt-4" onClick={() => navigate('/customers')}>Cancel</button>
    </div>
  )
}