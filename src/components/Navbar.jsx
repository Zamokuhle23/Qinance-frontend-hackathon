import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BarChart3, Calculator, Crown, CreditCard, LayoutDashboard, LogOut, Menu, Users, X, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const agentLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/batch-collect', label: 'Batch collect', icon: Zap },
  { href: '/loan-calculator', label: 'Calculator', icon: Calculator },
]

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/agents', label: 'Agents', icon: CreditCard },
  { href: '/admin/finance', label: 'Finance', icon: BarChart3 },
]

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  if (!user) return null

  const links = user.is_staff ? adminLinks : agentLinks
  const isActive = (href) => location.pathname === href || location.pathname.startsWith(`${href}/`)
  const handleLogout = () => {
    logoutUser()
    navigate('/login')
  }

  const navigation = (
    <>
      <nav className="app-nav" aria-label="Primary navigation">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} to={href} className={`app-nav__link${isActive(href) ? ' is-active' : ''}`} onClick={() => setOpen(false)}>
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-user">
        <span className="sidebar-user__avatar">{user.username?.slice(0, 1).toUpperCase()}</span>
        <div className="sidebar-user__details"><strong>{user.username}</strong><span>{user.is_staff ? 'Administrator' : 'Agent'}</span></div>
        <button type="button" className="icon-button icon-button--danger" onClick={handleLogout} aria-label="Log out"><LogOut size={18} /></button>
      </div>
    </>
  )

  return (
    <>
      <aside className="app-sidebar">
        <Link className="sidebar-brand" to={user.is_staff ? '/admin/dashboard' : '/dashboard'}>
          <span className="brand-mark"><Crown size={20} /></span>
          <span><strong>Qinance</strong><small>Kings of Future Finance</small></span>
        </Link>
        <div className="sidebar-label">Workspace</div>
        {navigation}
      </aside>

      <header className="mobile-header">
        <Link className="sidebar-brand" to={user.is_staff ? '/admin/dashboard' : '/dashboard'}>
          <span className="brand-mark"><Crown size={18} /></span><span><strong>Qinance</strong></span>
        </Link>
        <button type="button" className="icon-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="Toggle navigation">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
        {open && <div className="mobile-menu">{navigation}</div>}
      </header>
    </>
  )
}
