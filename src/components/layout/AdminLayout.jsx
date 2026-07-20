import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'

const menus = [
  { path: '/admin/dashboard', label: '대시보드' },
  { path: '/admin/orders', label: '주문/충전 관리' },
  { path: '/admin/products', label: '상품 관리' },
  { path: '/admin/members', label: '회원 관리' },
  { path: '/admin/notices', label: '공지사항 관리' },
  { path: '/admin/inquiries', label: '1:1 문의 관리' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const admin = JSON.parse(localStorage.getItem('adminInfo') || '{}')

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
    navigate('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <aside style={{ width: 200, background: '#1e293b', color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', fontSize: 18, fontWeight: 700, borderBottom: '1px solid #334155' }}>ssumpay ADMIN</div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {menus.map(m => (
            <Link key={m.path} to={m.path} style={{
              display: 'block', padding: '10px 20px', fontSize: 14, textDecoration: 'none',
              color: pathname.startsWith(m.path) ? '#fff' : '#94a3b8',
              background: pathname.startsWith(m.path) ? '#334155' : 'transparent'
            }}>{m.label}</Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #334155', fontSize: 13, color: '#94a3b8' }}>
          <div>{admin.name || 'Admin'}</div>
          <button onClick={logout} style={{ marginTop: 8, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: 13 }}>로그아웃</button>
        </div>
      </aside>
      <main style={{ flex: 1, background: '#f8fafc', padding: 32, overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}
