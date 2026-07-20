import { Outlet, Link, useNavigate } from 'react-router-dom'

export default function UserLayout() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token')

  const logout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ fontSize: 22, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>ssumpay</Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/customer" style={{ color: '#374151', textDecoration: 'none', fontSize: 14 }}>고객센터</Link>
          {isLoggedIn ? (
            <>
              <Link to="/mypage" style={{ padding: '6px 16px', border: '1px solid #2563eb', borderRadius: 20, color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>마이페이지</Link>
              <button onClick={logout} style={{ padding: '6px 16px', background: '#1e293b', borderRadius: 20, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/register" style={{ padding: '6px 16px', border: '1px solid #2563eb', borderRadius: 20, color: '#2563eb', textDecoration: 'none', fontSize: 14 }}>회원가입</Link>
              <Link to="/login" style={{ padding: '6px 16px', background: '#2563eb', borderRadius: 20, color: '#fff', textDecoration: 'none', fontSize: 14 }}>로그인</Link>
            </>
          )}
        </nav>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{ background: '#1e293b', color: '#94a3b8', padding: '32px 40px', fontSize: 13 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p>업체명 | 대표자명: 000 &nbsp; 사업자등록번호: 00000 &nbsp; 주소: 000000 &nbsp; Tel: 00000000</p>
          <div style={{ marginTop: 12, display: 'flex', gap: 20 }}>
            {['이용약관', '개인정보처리방침', '고객센터', '사업자정보'].map(t => (
              <Link key={t} to="/customer" style={{ color: '#94a3b8', textDecoration: 'none' }}>{t}</Link>
            ))}
          </div>
          <p style={{ marginTop: 12 }}>© 2026 ssumpay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
