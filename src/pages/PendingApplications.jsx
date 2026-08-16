import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPendingApplications, actionPendingApplication } from '../api/agent'

export default function PendingApplications() {
  const navigate = useNavigate()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [approvingId, setApprovingId] = useState(null)
  const [customAmounts, setCustomAmounts] = useState({})

  const loadApps = () => {
    setLoading(true)
    getPendingApplications()
      .then(res => {
        const pending = res.data.filter(a => a.status === 'pending')
        setApps(pending)
        const amts = {}
        pending.forEach(a => {
          amts[a.id] = a.ai_suggested_amount
        })
        setCustomAmounts(amts)
      })
      .catch(() => setError('Failed to load pending applications.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadApps()
    // Auto-refresh every 5s so AI advice appears once the background thread finishes
    const interval = setInterval(loadApps, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleAction = async (appId, action) => {
    setApprovingId(appId)
    setError('')
    setSuccess('')
    try {
      const payload = {}
      if (action === 'approve') {
        payload.amount = parseFloat(customAmounts[appId])
      }
      await actionPendingApplication(appId, action, payload)
      setSuccess(`Application successfully ${action === 'approve' ? 'approved & disbursed' : 'rejected'}!`)
      loadApps()
    } catch (err) {
      setError(err.response?.data?.error || 'Action failed.')
    } finally {
      setApprovingId(null)
    }
  }

  if (loading && apps.length === 0) return <div className="text-center mt-5"><div className="spinner-border text-primary" /></div>

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Pending Background Applications ({apps.length})</h4>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={loadApps}>⟳ Refresh</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/customers')}>Back to Directory</button>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}
      {success && <div className="alert alert-success mb-3">{success}</div>}

      {apps.length === 0 ? (
        <div className="card text-center py-5 shadow-sm border-0">
          <div className="card-body">
            <span style={{ fontSize: 48 }}>📥</span>
            <h5 className="fw-bold mt-2">No Pending Applications</h5>
            <p className="text-muted small">All background applications have been reviewed and approved!</p>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {apps.map(app => {
            const maxVal = app.ai_suggested_amount ? parseFloat(app.ai_suggested_amount) : 0
            const inputVal = parseFloat(customAmounts[app.id]) || 0
            const totalDue = round(inputVal + inputVal * 0.20, 2)
            const dailyPay = round(totalDue / 60, 2)
            const aiReady = app.ai_suggested_amount && app.ai_risk && app.ai_confidence !== null

            return (
              <div className="col-12" key={app.id}>
                <div className={`card shadow-sm mb-3 border-start border-4 ${aiReady ? 'border-success' : 'border-warning'}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className={`badge ${aiReady ? 'bg-success-light text-success' : 'bg-warning-light text-warning'} mb-1`}>
                          {aiReady ? 'Pre-calculated Advice' : '⏳ Gemini Analyzing...'}
                        </span>
                        <h5 className="fw-bold text-dark mb-0">{app.customer_name}</h5>
                        <p className="text-muted small mb-0">{app.customer_phone} · Location: {app.customer_location || 'Unknown'}</p>
                      </div>
                      {aiReady ? (
                        <span className={`badge bg-${app.ai_risk === 'low' ? 'success' : app.ai_risk === 'medium' ? 'warning' : 'danger'}`}>
                          Risk: {app.ai_risk.toUpperCase()} ({app.ai_confidence}% confidence)
                        </span>
                      ) : (
                        <span className="badge bg-secondary">Analyzing...</span>
                      )}
                    </div>

                    {aiReady ? (
                      <>
                        <div className="alert alert-light border mb-3 py-2 px-3">
                          <p className="mb-1 small"><strong>Gemini Assessment:</strong> {app.ai_explanation}</p>
                          {app.ai_reasons?.length > 0 && (
                            <p className="mb-0 small text-secondary"><strong>Key Factors:</strong> {app.ai_reasons.join(', ')}</p>
                          )}
                        </div>

                        <div className="row g-3 align-items-end">
                          <div className="col-md-3">
                            <label className="form-label small fw-bold mb-1">Approved Amount</label>
                            <div className="input-group">
                              <span className="input-group-text">E</span>
                              <input
                                type="number"
                                className="form-control fw-bold text-primary"
                                value={customAmounts[app.id] || ''}
                                max={maxVal}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0
                                  setCustomAmounts(prev => ({ ...prev, [app.id]: val }))
                                }}
                              />
                            </div>
                            <small className="text-muted">Max AI Suggested: E{maxVal}</small>
                          </div>

                          <div className="col-md-5">
                            <div className="border rounded px-3 py-2 bg-light d-flex justify-content-between text-center">
                              <div>
                                <span className="small text-muted d-block">Interest</span>
                                <span className="fw-bold small text-dark">20%</span>
                              </div>
                              <div>
                                <span className="small text-muted d-block">Duration</span>
                                <span className="fw-bold small text-dark">60 days</span>
                              </div>
                              <div>
                                <span className="small text-muted d-block">Total Due</span>
                                <span className="fw-bold small text-dark">E{totalDue}</span>
                              </div>
                              <div>
                                <span className="small text-muted d-block">Daily Payment</span>
                                <span className="fw-bold small text-primary">E{dailyPay}</span>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-4 d-flex gap-2 justify-content-end">
                            <button
                              className="btn btn-success"
                              disabled={approvingId !== null || inputVal > maxVal || inputVal <= 0}
                              onClick={() => handleAction(app.id, 'approve')}
                            >
                              {approvingId === app.id ? 'Processing...' : 'Approve & Disburse'}
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              disabled={approvingId !== null}
                              onClick={() => handleAction(app.id, 'reject')}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="d-flex align-items-center gap-2 py-3">
                        <div className="spinner-border spinner-border-sm text-warning" role="status" />
                        <span className="text-muted small">
                          Gemini is analyzing this customer's payment history in the background. This card will update automatically within a few seconds.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function round(num, decimals) {
  const t = Math.pow(10, decimals)
  return (Math.round((num + Number.EPSILON) * t) / t).toFixed(decimals)
}