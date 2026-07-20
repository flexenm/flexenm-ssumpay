import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PenLine, Tag } from 'lucide-react'
import { noticesApi, inquiriesApi } from '../../../api'

export default function CustomerCenterPage() {
  const [tab, setTab] = useState(0)
  const [notices, setNotices] = useState([])
  const [inquiries, setInquiries] = useState([])
  const isLoggedIn = !!localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    noticesApi.list().then(r => setNotices(r.data)).catch(() => {})
    if (isLoggedIn) inquiriesApi.list().then(r => setInquiries(r.data)).catch(() => {})
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>홈 &gt; 고객센터 &gt; 공지사항</p>
      <h1 style={{ fontSize: 32, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>고객센터</h1>
      <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: 40 }}>공지사항을 확인하고 궁금한 점은 언제든 문의해보세요</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
        {['공지사항', '1:1 문의'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)} style={{
            padding: '10px 48px', borderRadius: 24, border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 600,
            background: tab === i ? '#2563eb' : '#f1f5f9', color: tab === i ? '#fff' : '#374151'
          }}>{t}</button>
        ))}
      </div>

      {tab === 0 && (
        notices.length === 0
          ? <div style={{ textAlign: 'center', padding: 80, background: '#f8fafc', borderRadius: 12, color: '#94a3b8' }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>!</p>등록된 공지사항이 없습니다.
            </div>
          : notices.map(n => (
            <Link key={n.id} to={`/customer/notices/${n.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid #e5e7eb', textDecoration: 'none', color: '#1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Tag size={15} color="#2563eb" strokeWidth={2} />
                <span style={{ fontWeight: n.isPinned ? 700 : 400 }}>{n.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#94a3b8', fontSize: 13 }}>
                {new Date(n.createdAt).toLocaleDateString()} <span>&gt;</span>
              </div>
            </Link>
          ))
      )}

      {tab === 1 && (
        <div>
          {isLoggedIn && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
              <button onClick={() => navigate('/customer/inquiries/new')} style={{ padding: '8px 20px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}><PenLine size={15} /> 문의하기</button>
            </div>
          )}
          {inquiries.map(q => (
            <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ padding: '4px 10px', borderRadius: 12, background: q.status === 1 ? '#2563eb' : '#f1f5f9', color: q.status === 1 ? '#fff' : '#94a3b8', fontSize: 12 }}>{q.status === 1 ? '답변 완료' : '답변 대기'}</span>
                <span>{q.title}</span>
              </div>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{new Date(q.createdAt).toLocaleString()} &gt;</span>
            </div>
          ))}
          {!isLoggedIn && <div style={{ marginTop: 24, padding: 16, background: '#eff6ff', borderRadius: 8, textAlign: 'center', fontSize: 14, color: '#64748b' }}>ℹ️ 1:1 문의는 로그인 후 이용할 수 있습니다.</div>}
        </div>
      )}
    </div>
  )
}
